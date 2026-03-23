-- Streak + invite counts for badges; rename legacy captain badge row to founder.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS daily_login_streak integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS invitations_sent_count integer NOT NULL DEFAULT 0;

UPDATE public.user_badges SET badge_id = 'founder' WHERE badge_id = 'captain';

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
      NEW.daily_login_streak := 0;
      NEW.invitations_sent_count := 0;
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
    NEW.daily_login_streak := OLD.daily_login_streak;
    NEW.invitations_sent_count := OLD.invitations_sent_count;

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
