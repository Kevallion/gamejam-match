-- is_team_owner_or_member(uuid) is a SECURITY DEFINER helper used by the
-- team_discord_links_select_members policy (TO authenticated) and inside
-- get_team_discord_link() (SECURITY DEFINER). Neither the app nor any anon
-- path calls it, so signed-out callers lose EXECUTE (Supabase's default
-- privileges grant it to anon). authenticated and service_role keep it,
-- re-granted explicitly. Approved by Wisllor, 20 Nov 2026.
-- No data change. Idempotent; skipped when the function does not exist.

DO $$
BEGIN
  IF to_regprocedure('public.is_team_owner_or_member(uuid)') IS NOT NULL THEN
    REVOKE EXECUTE ON FUNCTION public.is_team_owner_or_member(uuid) FROM PUBLIC, anon;
    GRANT EXECUTE ON FUNCTION public.is_team_owner_or_member(uuid) TO authenticated, service_role;
  END IF;
END $$;
