-- Allow up to 3 availability announcements per user (instead of overwriting)
-- Each post = one date range; profile info (role, bio, etc.) is shared from profiles

CREATE TABLE IF NOT EXISTS public.availability_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  availability text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- RLS
ALTER TABLE public.availability_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "availability_posts_select_all"
  ON public.availability_posts FOR SELECT USING (true);

CREATE POLICY "availability_posts_insert_own"
  ON public.availability_posts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "availability_posts_delete_own"
  ON public.availability_posts FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION public.availability_posts_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER availability_posts_updated_at_trigger
  BEFORE UPDATE ON public.availability_posts
  FOR EACH ROW
  EXECUTE FUNCTION public.availability_posts_updated_at();

-- Migrate existing profiles with availability to availability_posts
INSERT INTO public.availability_posts (user_id, availability)
SELECT id, availability
FROM public.profiles
WHERE availability IS NOT NULL
  AND availability != ''
  AND NOT EXISTS (
    SELECT 1 FROM public.availability_posts ap WHERE ap.user_id = profiles.id
  );
