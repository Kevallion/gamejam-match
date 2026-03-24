-- Nightly pg_cron: only availability_posts (teams archived via /api/cron/cleanup-expired-teams + e-mail).
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

SELECT cron.schedule(
  'delete-expired-teams',
  '0 0 * * *',
  $$DELETE FROM public.availability_posts WHERE expires_at < now();$$
);
