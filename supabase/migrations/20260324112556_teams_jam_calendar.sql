-- Jam calendar: explicit jam window; listing visibility ends at jam_end_date (synced to expires_at).
-- Applied on Supabase (GameJamCrew) via MCP as version 20260324112556.

ALTER TABLE public.teams
  ADD COLUMN IF NOT EXISTS jam_start_date timestamptz,
  ADD COLUMN IF NOT EXISTS jam_end_date timestamptz;

-- Backfill existing teams so listings behave as before (start = created_at, end = expires_at).
UPDATE public.teams
SET
  jam_start_date = COALESCE(created_at, now()),
  jam_end_date = COALESCE(expires_at, now() + interval '30 days')
WHERE jam_start_date IS NULL OR jam_end_date IS NULL;

ALTER TABLE public.teams
  ALTER COLUMN jam_start_date SET NOT NULL,
  ALTER COLUMN jam_end_date SET NOT NULL;

-- Keep expires_at aligned with jam_end_date on every write (single source of truth: jam_end_date).
CREATE OR REPLACE FUNCTION public.teams_sync_expires_from_jam_end()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.jam_end_date IS NOT NULL THEN
    NEW.expires_at := NEW.jam_end_date;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS teams_sync_expires_from_jam_end_trg ON public.teams;

CREATE TRIGGER teams_sync_expires_from_jam_end_trg
  BEFORE INSERT OR UPDATE ON public.teams
  FOR EACH ROW
  EXECUTE FUNCTION public.teams_sync_expires_from_jam_end();

-- Re-sync any rows where expires_at drifted from jam_end_date.
UPDATE public.teams
SET expires_at = jam_end_date;
