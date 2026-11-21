-- Lock down trigger functions (Supabase advisors, approved by Wisllor 20 Nov 2026).
--
-- 1. handle_new_user() and profiles_enforce_gamification_columns() are
--    SECURITY DEFINER trigger functions that anon and authenticated could call
--    through /rest/v1/rpc. EXECUTE is revoked from PUBLIC, anon and
--    authenticated. Triggers keep firing: PostgreSQL checks EXECUTE on the
--    trigger function only when the trigger is created, not when it fires.
--    service_role and the owner (postgres) keep their privileges.
-- 2. The four other trigger functions flagged as "mutable search_path" get a
--    pinned search_path (public, pg_temp) and lose EXECUTE for the API roles
--    too (they are trigger functions, never called as RPC by the app).
--
-- No data is read or changed. Idempotent; a missing function is skipped.

DO $$
DECLARE
  fn text;
BEGIN
  FOREACH fn IN ARRAY ARRAY[
    'public.handle_new_user()',
    'public.profiles_enforce_gamification_columns()',
    'public.profile_roles_enforce_max_two()',
    'public.availability_posts_updated_at()',
    'public.profile_roles_updated_at()',
    'public.teams_sync_expires_from_jam_end()'
  ]
  LOOP
    IF to_regprocedure(fn) IS NOT NULL THEN
      EXECUTE format('REVOKE EXECUTE ON FUNCTION %s FROM PUBLIC, anon, authenticated', fn);
    END IF;
  END LOOP;

  FOREACH fn IN ARRAY ARRAY[
    'public.profile_roles_enforce_max_two()',
    'public.availability_posts_updated_at()',
    'public.profile_roles_updated_at()',
    'public.teams_sync_expires_from_jam_end()'
  ]
  LOOP
    IF to_regprocedure(fn) IS NOT NULL THEN
      EXECUTE format('ALTER FUNCTION %s SET search_path = public, pg_temp', fn);
    END IF;
  END LOOP;
END $$;
