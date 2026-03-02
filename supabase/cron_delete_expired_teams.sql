-- Cron Job: Delete expired team listings every night at midnight (UTC)
-- Run this once in Supabase SQL Editor after enabling pg_cron.
--
-- Prerequisites: In Supabase Dashboard > Database > Extensions, enable "pg_cron"
-- Or run: CREATE EXTENSION IF NOT EXISTS pg_cron;

SELECT cron.schedule(
  'delete-expired-teams',
  '0 0 * * *',  -- Every day at 00:00 UTC
  $$ DELETE FROM public.teams WHERE expires_at < now() $$
);
