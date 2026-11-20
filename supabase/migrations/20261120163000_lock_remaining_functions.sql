-- Remaining function hardening from Forge's S5 report (approved by Wisllor,
-- 20 Nov 2026).
--
-- 1. reject_join_request_for_existing_member() is the BEFORE INSERT trigger
--    function of join_requests (SECURITY INVOKER). Nothing calls it as an RPC
--    (no app code, policy or other function), so EXECUTE is revoked from
--    PUBLIC, anon and authenticated. The trigger keeps firing: EXECUTE on a
--    trigger function is only checked at CREATE TRIGGER. service_role and the
--    owner keep their privileges. Its search_path gets pg_temp last as well.
-- 2. handle_new_user() and profiles_enforce_gamification_columns() (SECURITY
--    DEFINER trigger functions) go from search_path = public to
--    public, pg_temp, like the other trigger functions. Their bodies only use
--    schema-qualified tables (public.profiles, auth.uid()) and built-ins, so
--    nothing can resolve to pg_temp.
--
-- No data is read or changed. Idempotent; a missing function is skipped.

DO $$
DECLARE
  fn text;
BEGIN
  IF to_regprocedure('public.reject_join_request_for_existing_member()') IS NOT NULL THEN
    REVOKE EXECUTE ON FUNCTION public.reject_join_request_for_existing_member() FROM PUBLIC, anon, authenticated;
  END IF;

  FOREACH fn IN ARRAY ARRAY[
    'public.reject_join_request_for_existing_member()',
    'public.handle_new_user()',
    'public.profiles_enforce_gamification_columns()'
  ]
  LOOP
    IF to_regprocedure(fn) IS NOT NULL THEN
      EXECUTE format('ALTER FUNCTION %s SET search_path = public, pg_temp', fn);
    END IF;
  END LOOP;
END $$;
