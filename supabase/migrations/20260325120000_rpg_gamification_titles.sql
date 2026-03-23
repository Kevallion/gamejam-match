-- RPG-style titles + daily login tracking on profiles.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS last_daily_xp_at timestamptz NULL,
  ADD COLUMN IF NOT EXISTS unlocked_titles jsonb NOT NULL DEFAULT '["Rookie Jammer"]'::jsonb,
  ADD COLUMN IF NOT EXISTS current_title text NOT NULL DEFAULT 'Rookie Jammer';

UPDATE public.profiles
SET
  unlocked_titles = COALESCE(
    NULLIF(unlocked_titles, 'null'::jsonb),
    '["Rookie Jammer"]'::jsonb
  ),
  current_title = COALESCE(NULLIF(TRIM(current_title), ''), 'Rookie Jammer')
WHERE unlocked_titles IS NULL
   OR jsonb_typeof(unlocked_titles) <> 'array'
   OR current_title IS NULL
   OR TRIM(current_title) = '';

-- Harden trigger: lock XP/level/daily/titles from client; allow changing current_title only to an unlocked title.
CREATE OR REPLACE FUNCTION public.profiles_enforce_gamification_columns()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF auth.uid() IS NOT NULL AND auth.uid() = NEW.id THEN
      NEW.xp := 0;
      NEW.level := 1;
      NEW.last_daily_xp_at := NULL;
      NEW.unlocked_titles := '["Rookie Jammer"]'::jsonb;
      IF NEW.current_title IS NULL OR TRIM(NEW.current_title) = '' THEN
        NEW.current_title := 'Rookie Jammer';
      END IF;
    END IF;
    RETURN NEW;
  END IF;

  IF TG_OP = 'UPDATE' AND auth.uid() IS NOT NULL THEN
    NEW.xp := COALESCE(OLD.xp, 0);
    NEW.level := COALESCE(OLD.level, 1);
    NEW.last_daily_xp_at := OLD.last_daily_xp_at;
    NEW.unlocked_titles := OLD.unlocked_titles;

    IF NEW.current_title IS DISTINCT FROM OLD.current_title THEN
      IF NOT (
        COALESCE(OLD.unlocked_titles, '[]'::jsonb) @> jsonb_build_array(NEW.current_title)
      ) THEN
        NEW.current_title := OLD.current_title;
      END IF;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;
