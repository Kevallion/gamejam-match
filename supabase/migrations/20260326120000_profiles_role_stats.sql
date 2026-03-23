-- Per-role join counts for role-based title unlocks (updated via service role in awardXP).

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS role_stats jsonb NOT NULL DEFAULT '{}'::jsonb;

UPDATE public.profiles
SET role_stats = '{}'::jsonb
WHERE role_stats IS NULL OR jsonb_typeof(role_stats) <> 'object';

-- Keep role_stats server-only for authenticated profile updates (same pattern as xp / unlocked_titles).
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
      NEW.role_stats := '{}'::jsonb;
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
    NEW.role_stats := OLD.role_stats;

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
