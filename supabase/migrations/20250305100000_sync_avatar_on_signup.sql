-- Sync avatar_url and username from auth (Google/Discord/email) to profiles on signup
-- Google: raw_user_meta_data.picture
-- Discord: raw_user_meta_data.avatar_url
-- Email: raw_user_meta_data.avatar_url (if set)

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  meta jsonb;
  avatar text;
  uname text;
BEGIN
  meta := COALESCE(NEW.raw_user_meta_data, '{}'::jsonb);
  avatar := COALESCE(meta->>'avatar_url', meta->>'picture');
  uname := COALESCE(NULLIF(TRIM(meta->>'full_name'), ''), NULLIF(TRIM(meta->>'name'), ''), 'Jammer');

  INSERT INTO public.profiles (id, username, avatar_url)
  VALUES (NEW.id, uname, avatar)
  ON CONFLICT (id) DO UPDATE SET
    avatar_url = COALESCE(NULLIF(TRIM(profiles.avatar_url), ''), EXCLUDED.avatar_url),
    username = COALESCE(NULLIF(TRIM(profiles.username), ''), EXCLUDED.username);

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enable realtime for notifications (required for postgres_changes)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'notifications'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
  END IF;
END;
$$;

-- Backfill existing users: sync avatar from auth to profiles where profiles.avatar_url is empty
UPDATE public.profiles p
SET avatar_url = COALESCE(
  NULLIF(TRIM(p.avatar_url), ''),
  u.raw_user_meta_data->>'avatar_url',
  u.raw_user_meta_data->>'picture'
)
FROM auth.users u
WHERE p.id = u.id
  AND (p.avatar_url IS NULL OR TRIM(p.avatar_url) = '')
  AND (u.raw_user_meta_data->>'avatar_url' IS NOT NULL OR u.raw_user_meta_data->>'picture' IS NOT NULL);
