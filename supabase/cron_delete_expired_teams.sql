-- =============================================================================
-- Supabase: automatic cleanup of expired team listings (pg_cron)
-- =============================================================================
-- Run this entire script once in: Supabase Dashboard → SQL Editor (as postgres).
--
-- Prerequisites:
--   - Table public.teams has column expires_at (see migration 20250302130000).
--   - Optional: enable "pg_cron" in Dashboard → Database → Extensions, then you
--     can skip the CREATE EXTENSION line if it already exists.
--
-- Schedule: every day at 00:00 UTC —
--   - Team listings: cleanup is handled by the app (e-mail owner, then DELETE) via
--     GET /api/cron/cleanup-expired-teams with Authorization: Bearer CRON_SECRET.
--     Do not DELETE public.teams here or owners will not receive the archival e-mail.
--   - DELETE expired availability_posts (member announcements) — still safe in SQL.
-- =============================================================================

-- 1) Enable pg_cron (Supabase: extension lives under schema "extensions")
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;

-- Grants often required on Supabase so the postgres role can manage jobs:
GRANT USAGE ON SCHEMA cron TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA cron TO postgres;

-- 2) Ensure related rows are deleted when a team row is deleted
--    (GameJam Match migrations already use CASCADE; this block is safe to re-run.)

ALTER TABLE public.join_requests
  DROP CONSTRAINT IF EXISTS join_requests_team_id_fkey;

ALTER TABLE public.join_requests
  ADD CONSTRAINT join_requests_team_id_fkey
  FOREIGN KEY (team_id) REFERENCES public.teams(id) ON DELETE CASCADE;

ALTER TABLE public.team_members
  DROP CONSTRAINT IF EXISTS team_members_team_id_fkey;

ALTER TABLE public.team_members
  ADD CONSTRAINT team_members_team_id_fkey
  FOREIGN KEY (team_id) REFERENCES public.teams(id) ON DELETE CASCADE;

-- team_messages: constraint name is usually team_messages_team_id_fkey
ALTER TABLE public.team_messages
  DROP CONSTRAINT IF EXISTS team_messages_team_id_fkey;

ALTER TABLE public.team_messages
  ADD CONSTRAINT team_messages_team_id_fkey
  FOREIGN KEY (team_id) REFERENCES public.teams(id) ON DELETE CASCADE;

-- If DROP fails with a different constraint name, list FKs with:
--   SELECT conname FROM pg_constraint
--   WHERE conrelid = 'public.team_messages'::regclass AND contype = 'f';

-- 3) Replace existing job with the same name (idempotent)
DO $$
DECLARE
  jid bigint;
BEGIN
  SELECT jobid INTO jid FROM cron.job WHERE jobname = 'delete-expired-teams';
  IF jid IS NOT NULL THEN
    PERFORM cron.unschedule(jid);
  END IF;
END;
$$;

-- 4) Schedule: every night at 00:00 UTC
SELECT cron.schedule(
  'delete-expired-teams',
  '0 0 * * *',
  $$DELETE FROM public.availability_posts WHERE expires_at < now();$$
);

-- Verify:
--   SELECT * FROM cron.job WHERE jobname = 'delete-expired-teams';
--   SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 20;
