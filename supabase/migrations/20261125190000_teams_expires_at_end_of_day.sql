-- ONB-5: keep expires_at at the end of the UTC calendar day of jam_end_date.
-- Needed because jam dates are now stored at 12:00 UTC; the previous trigger
-- copied that noon instant onto expires_at, so listings dropped ~12 hours early.
-- Staging only in this ticket; do not apply on production without Wisllor's approval.
-- Idempotent: CREATE OR REPLACE of the existing trigger function. EXECUTE stays
-- revoked from API roles (see 20261120160000_lock_trigger_functions.sql).

CREATE OR REPLACE FUNCTION public.teams_sync_expires_from_jam_end()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  IF NEW.jam_end_date IS NOT NULL THEN
    NEW.expires_at := (
      (pg_catalog.timezone('UTC', NEW.jam_end_date))::date + time '23:59:59.999'
    ) AT TIME ZONE 'UTC';
  END IF;
  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.teams_sync_expires_from_jam_end() FROM PUBLIC, anon, authenticated;
