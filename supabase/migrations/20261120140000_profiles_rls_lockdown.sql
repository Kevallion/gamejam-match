-- S7: close public API reads on profiles and on the tables around them
-- (Forge audit, 20 Nov 2026; scope extended by Wisllor the same day).
--
-- Summary
--   1. profiles: table-level SELECT revoked from anon/authenticated; only an
--      explicit column list is granted. Rows are readable when the profile is
--      published, is the caller's own, or is related to the caller.
--   2. discord_username: only via public.get_visible_discord_usernames()
--      (SECURITY DEFINER, authenticated): self, squadmates, or the other side of
--      an accepted application/invitation.
--   3. teams.discord_link: no longer readable through the API; squad members get
--      the invite through public.get_team_discord_link() / team_discord_links.
--   4. availability_posts: only active posts are public (owner still sees all of
--      their own); the profile copies stored on posts (username, bio, role, ...)
--      are no longer readable. Existing data is NOT modified.
--   5. user_badges, profile_roles, team_members follow the profile rule.
--   6. Private tables: no USING (true) / WITH CHECK (true) policies, no anon
--      SELECT; two policies whose subquery compared a column with itself
--      (any squad member could read every squad chat) are fixed.
--
-- service_role (admin client) is unaffected: it bypasses RLS and keeps its
-- table privileges. No row is inserted, updated or deleted by this migration.
-- Idempotent: safe to run more than once.

-- ===========================================================================
-- 1. Visibility helpers
-- ===========================================================================

-- Published = onboarding completed AND the jammer chose to be publicly visible:
--   * an active availability post: this is what the onboarding "Publish my
--     profile" toggle (publishImmediately) and the Post Availability form
--     create; there is no separate profile column for the toggle, or
--   * owner or member of a squad (squad pages are public).
-- A fresh sign-up (has_completed_onboarding false/NULL) or a jammer who left the
-- toggle off and has no squad is therefore not public.
CREATE OR REPLACE FUNCTION public.profile_is_published(p_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT p_user_id IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = p_user_id AND p.has_completed_onboarding IS TRUE
  )
  AND (
    EXISTS (
      SELECT 1 FROM public.availability_posts ap
      WHERE ap.user_id = p_user_id AND ap.expires_at > now()
    )
    OR EXISTS (SELECT 1 FROM public.teams t WHERE t.user_id = p_user_id)
    OR EXISTS (SELECT 1 FROM public.team_members tm WHERE tm.user_id = p_user_id)
  );
$$;

-- Related = the signed-in caller has a direct link with this jammer:
--   * it is the caller,
--   * an application/invitation between them (either side, any status),
--   * a notification this jammer sent to the caller,
--   * a chat message this jammer posted in a squad the caller owns or belongs to.
CREATE OR REPLACE FUNCTION public.profile_is_related(p_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT auth.uid() IS NOT NULL AND p_user_id IS NOT NULL AND (
    p_user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.join_requests jr
      JOIN public.teams t ON t.id = jr.team_id
      WHERE (jr.sender_id = p_user_id AND t.user_id = auth.uid())
         OR (jr.sender_id = auth.uid() AND t.user_id = p_user_id)
    )
    OR EXISTS (
      SELECT 1 FROM public.notifications n
      WHERE n.user_id = auth.uid() AND n.sender_id = p_user_id
    )
    OR EXISTS (
      SELECT 1 FROM public.team_messages m
      WHERE m.sender_id = p_user_id
        AND (
          EXISTS (SELECT 1 FROM public.teams t WHERE t.id = m.team_id AND t.user_id = auth.uid())
          OR EXISTS (SELECT 1 FROM public.team_members me WHERE me.team_id = m.team_id AND me.user_id = auth.uid())
        )
    )
  );
$$;

-- The single entry point used by row policies (anon: published only).
CREATE OR REPLACE FUNCTION public.can_view_profile(p_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT public.profile_is_published(p_user_id) OR public.profile_is_related(p_user_id);
$$;

-- Internal helpers: not callable by API roles (Supabase grants EXECUTE on new
-- functions to anon/authenticated by default, so revoke explicitly).
REVOKE ALL ON FUNCTION public.profile_is_published(uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.profile_is_related(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.profile_is_published(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.profile_is_related(uuid) TO service_role;
-- Called inside row policies, so the API roles need EXECUTE. Returns a boolean only.
REVOKE ALL ON FUNCTION public.can_view_profile(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.can_view_profile(uuid) TO anon, authenticated, service_role;

-- Lookups used by the helpers (no-ops when they already exist).
CREATE INDEX IF NOT EXISTS idx_availability_posts_user_expires ON public.availability_posts (user_id, expires_at);
CREATE INDEX IF NOT EXISTS idx_teams_user_id ON public.teams (user_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON public.team_members (user_id);
CREATE INDEX IF NOT EXISTS idx_join_requests_sender_id ON public.join_requests (sender_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_sender ON public.notifications (user_id, sender_id);
CREATE INDEX IF NOT EXISTS idx_team_messages_sender_team ON public.team_messages (sender_id, team_id);

-- Drops every SELECT/ALL policy granted to the API roles whose USING is a bare
-- `true` (prod may have dashboard-created ones with other names).
CREATE OR REPLACE FUNCTION pg_temp.drop_open_policies(p_table text, p_read_only boolean)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  pol record;
BEGIN
  FOR pol IN
    SELECT policyname, cmd, qual, with_check
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = p_table
      AND roles && ARRAY['public', 'anon', 'authenticated']::name[]
      AND (
        (cmd IN ('SELECT', 'ALL') AND btrim(coalesce(qual, '')) IN ('true', '(true)'))
        OR (NOT p_read_only AND (
          btrim(coalesce(qual, '')) IN ('true', '(true)')
          OR btrim(coalesce(with_check, '')) IN ('true', '(true)')
        ))
      )
  LOOP
    RAISE NOTICE 'S7: dropping open policy % (%) on public.%', pol.policyname, pol.cmd, p_table;
    EXECUTE format('DROP POLICY %I ON public.%I', pol.policyname, p_table);
  END LOOP;
END;
$$;

-- ===========================================================================
-- 2. profiles
-- ===========================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_all" ON public.profiles;
DO $$ BEGIN PERFORM pg_temp.drop_open_policies('profiles', true); END $$;
DROP POLICY IF EXISTS profiles_select_visible ON public.profiles;
DROP POLICY IF EXISTS profiles_select_own ON public.profiles;

CREATE POLICY profiles_select_visible
  ON public.profiles FOR SELECT TO anon, authenticated
  USING (public.can_view_profile(id));

CREATE POLICY profiles_select_own
  ON public.profiles FOR SELECT TO authenticated
  USING (id = auth.uid());

-- INSERT / UPDATE / DELETE policies (owner only) are unchanged.

-- Column privileges. A column-level REVOKE has no effect while a table-level
-- SELECT exists, so: revoke table SELECT, clear any column SELECT, then grant
-- only the listed columns. Columns missing in an environment are skipped.
REVOKE SELECT ON TABLE public.profiles FROM anon, authenticated;
REVOKE TRUNCATE, TRIGGER, REFERENCES ON TABLE public.profiles FROM anon, authenticated;
-- anon never writes profiles (the policies already require auth.uid()).
REVOKE INSERT, UPDATE, DELETE ON TABLE public.profiles FROM anon;

DO $$
DECLARE
  -- Shown on public pages (Directory, Available, /jammer, squads, chat,
  -- notifications) or used as public filters.
  public_cols text[] := ARRAY[
    'id', 'username', 'avatar_url', 'bio',
    'role', 'main_role', 'default_role',
    'experience', 'experience_level', 'jam_style',
    'engine', 'default_engine', 'language', 'default_language',
    'portfolio_link', 'portfolio_url', 'programming_languages',
    'xp', 'current_title', 'jam_id', 'has_completed_onboarding'
  ];
  -- Read by the owner's own screens through the user session (dashboard,
  -- gamification). Column grants are not per row, so these are also readable on
  -- other visible profiles; they are low sensitivity.
  -- email_* (S3 email preferences, migration 20261120120000) are read by the
  -- owner's Settings tab; skipped harmlessly when the columns do not exist yet.
  authenticated_extra_cols text[] := ARRAY[
    'onboarding_version', 'unlocked_titles',
    'email_team_activity', 'email_matching_announcements'
  ];
  col record;
BEGIN
  FOR col IN
    SELECT a.attname FROM pg_attribute a
    WHERE a.attrelid = 'public.profiles'::regclass AND a.attnum > 0 AND NOT a.attisdropped
  LOOP
    EXECUTE format('REVOKE SELECT (%I) ON TABLE public.profiles FROM anon, authenticated', col.attname);
    IF col.attname = ANY (public_cols) THEN
      EXECUTE format('GRANT SELECT (%I) ON TABLE public.profiles TO anon, authenticated', col.attname);
    ELSIF col.attname = ANY (authenticated_extra_cols) THEN
      EXECUTE format('GRANT SELECT (%I) ON TABLE public.profiles TO authenticated', col.attname);
    END IF;
  END LOOP;
END $$;
-- Not readable through the API (never granted, whatever the row policy):
-- discord_username (only via get_visible_discord_usernames), last_chat_email_sent,
-- launch_jam_announcement_sent_at, last_daily_xp_at, daily_login_streak,
-- invitations_sent_count, role_stats, level, availability, created_at,
-- updated_at, and any column added later until it is granted explicitly.

-- ===========================================================================
-- 3. discord_username: checked SECURITY DEFINER getter only
-- ===========================================================================
-- One row per requested id the caller may see. Others are absent. Handle comes
-- from profile_discord_usernames when the row exists, else the legacy
-- profiles.discord_username column.
CREATE OR REPLACE FUNCTION public.get_visible_discord_usernames(p_user_ids uuid[])
RETURNS TABLE (user_id uuid, discord_username text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  WITH me AS (SELECT auth.uid() AS id),
  wanted AS (
    SELECT DISTINCT u AS id
    FROM unnest(COALESCE(p_user_ids, ARRAY[]::uuid[])) AS u
    WHERE u IS NOT NULL
    LIMIT 500
  ),
  allowed AS (
    SELECT w.id
    FROM wanted w, me
    WHERE me.id IS NOT NULL AND (
      w.id = me.id
      -- Same squad (owner or member on both sides).
      OR EXISTS (
        SELECT 1 FROM public.teams t
        WHERE (t.user_id = me.id
               OR EXISTS (SELECT 1 FROM public.team_members a WHERE a.team_id = t.id AND a.user_id = me.id))
          AND (t.user_id = w.id
               OR EXISTS (SELECT 1 FROM public.team_members b WHERE b.team_id = t.id AND b.user_id = w.id))
      )
      -- Accepted application or invitation between the two (sender_id is the
      -- jammer in both cases; the squad owner is the other side).
      OR EXISTS (
        SELECT 1 FROM public.join_requests jr
        JOIN public.teams t ON t.id = jr.team_id
        WHERE jr.status = 'accepted'
          AND ((jr.sender_id = w.id AND t.user_id = me.id)
               OR (jr.sender_id = me.id AND t.user_id = w.id))
      )
    )
  )
  SELECT a.id,
         CASE WHEN pdu.user_id IS NOT NULL THEN NULLIF(btrim(pdu.discord_username), '')
              ELSE NULLIF(btrim(p.discord_username), '') END
  FROM allowed a
  LEFT JOIN public.profiles p ON p.id = a.id
  LEFT JOIN public.profile_discord_usernames pdu ON pdu.user_id = a.id;
$$;

REVOKE ALL ON FUNCTION public.get_visible_discord_usernames(uuid[]) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_visible_discord_usernames(uuid[]) TO authenticated, service_role;

-- The side table no longer exposes other users' handles directly.
DROP POLICY IF EXISTS profile_discord_usernames_select_teammates ON public.profile_discord_usernames;
DROP POLICY IF EXISTS profile_discord_usernames_select_self ON public.profile_discord_usernames;
CREATE POLICY profile_discord_usernames_select_self
  ON public.profile_discord_usernames FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- ===========================================================================
-- 4. teams.discord_link (legacy copy of the invite)
-- ===========================================================================
REVOKE SELECT ON TABLE public.teams FROM anon, authenticated;
REVOKE TRUNCATE, TRIGGER, REFERENCES ON TABLE public.teams FROM anon, authenticated;
DO $$
DECLARE
  col record;
BEGIN
  FOR col IN
    SELECT a.attname FROM pg_attribute a
    WHERE a.attrelid = 'public.teams'::regclass AND a.attnum > 0 AND NOT a.attisdropped
  LOOP
    IF col.attname = 'discord_link' THEN
      EXECUTE format('REVOKE SELECT (%I) ON TABLE public.teams FROM anon, authenticated', col.attname);
    ELSE
      EXECUTE format('GRANT SELECT (%I) ON TABLE public.teams TO anon, authenticated', col.attname);
    END IF;
  END LOOP;
END $$;

-- Invite for a squad the caller owns or belongs to; NULL otherwise.
CREATE OR REPLACE FUNCTION public.get_team_discord_link(p_team_id uuid)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT CASE
    WHEN auth.uid() IS NOT NULL AND public.is_team_owner_or_member(p_team_id) THEN
      COALESCE(
        (SELECT NULLIF(btrim(l.discord_link), '') FROM public.team_discord_links l WHERE l.team_id = p_team_id),
        (SELECT NULLIF(btrim(t.discord_link), '') FROM public.teams t WHERE t.id = p_team_id)
      )
  END;
$$;

REVOKE ALL ON FUNCTION public.get_team_discord_link(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_team_discord_link(uuid) TO authenticated, service_role;
REVOKE ALL ON TABLE public.team_discord_links FROM anon;

-- ===========================================================================
-- 5. availability_posts
-- ===========================================================================
ALTER TABLE public.availability_posts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "availability_posts_select_all" ON public.availability_posts;
DO $$ BEGIN PERFORM pg_temp.drop_open_policies('availability_posts', true); END $$;
DROP POLICY IF EXISTS availability_posts_select_active ON public.availability_posts;
DROP POLICY IF EXISTS availability_posts_select_own ON public.availability_posts;

-- Active posts of published (hence onboarded) jammers only.
CREATE POLICY availability_posts_select_active
  ON public.availability_posts FOR SELECT TO anon, authenticated
  USING (expires_at > now() AND public.can_view_profile(user_id));

CREATE POLICY availability_posts_select_own
  ON public.availability_posts FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- Profile copies stored on posts are no longer readable (the app reads the
-- published profile instead). The data itself is left untouched.
REVOKE SELECT ON TABLE public.availability_posts FROM anon, authenticated;
REVOKE TRUNCATE, TRIGGER, REFERENCES ON TABLE public.availability_posts FROM anon, authenticated;
DO $$
DECLARE
  copied_cols text[] := ARRAY[
    'username', 'avatar_url', 'bio', 'portfolio_link',
    'role', 'experience', 'jam_style', 'engine', 'language'
  ];
  col record;
BEGIN
  FOR col IN
    SELECT a.attname FROM pg_attribute a
    WHERE a.attrelid = 'public.availability_posts'::regclass AND a.attnum > 0 AND NOT a.attisdropped
  LOOP
    IF col.attname = ANY (copied_cols) THEN
      EXECUTE format('REVOKE SELECT (%I) ON TABLE public.availability_posts FROM anon, authenticated', col.attname);
    ELSE
      EXECUTE format('GRANT SELECT (%I) ON TABLE public.availability_posts TO anon, authenticated', col.attname);
    END IF;
  END LOOP;
END $$;

-- ===========================================================================
-- 6. user_badges, profile_roles, team_members follow the profile rule
-- ===========================================================================
DO $$
DECLARE
  tbl text;
BEGIN
  FOREACH tbl IN ARRAY ARRAY['user_badges', 'profile_roles', 'team_members'] LOOP
    IF to_regclass('public.' || tbl) IS NULL THEN
      CONTINUE;
    END IF;
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', tbl);
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', tbl || '_select_all', tbl);
    PERFORM pg_temp.drop_open_policies(tbl, true);
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', tbl || '_select_visible', tbl);
    EXECUTE format(
      'CREATE POLICY %I ON public.%I FOR SELECT TO anon, authenticated USING (public.can_view_profile(user_id))',
      tbl || '_select_visible', tbl);
    EXECUTE format('REVOKE TRUNCATE, TRIGGER, REFERENCES ON TABLE public.%I FROM anon, authenticated', tbl);
  END LOOP;
END $$;

-- ===========================================================================
-- 7. Private tables
-- ===========================================================================
-- Fix: these subqueries compared tm.team_id with itself (the unqualified
-- `team_id` resolved to tm), so any squad member could read and post in every
-- squad chat, and read every accepted application.
DO $$
BEGIN
  IF to_regclass('public.team_messages') IS NOT NULL THEN
    DROP POLICY IF EXISTS "team_messages_select_team_members_only" ON public.team_messages;
    CREATE POLICY "team_messages_select_team_members_only"
      ON public.team_messages FOR SELECT TO authenticated
      USING (
        EXISTS (SELECT 1 FROM public.team_members tm
                WHERE tm.team_id = team_messages.team_id AND tm.user_id = auth.uid())
        OR EXISTS (SELECT 1 FROM public.teams t
                   WHERE t.id = team_messages.team_id AND t.user_id = auth.uid())
      );
    DROP POLICY IF EXISTS "team_messages_insert_team_members_only" ON public.team_messages;
    CREATE POLICY "team_messages_insert_team_members_only"
      ON public.team_messages FOR INSERT TO authenticated
      WITH CHECK (
        sender_id = auth.uid()
        AND (
          EXISTS (SELECT 1 FROM public.team_members tm
                  WHERE tm.team_id = team_messages.team_id AND tm.user_id = auth.uid())
          OR EXISTS (SELECT 1 FROM public.teams t
                     WHERE t.id = team_messages.team_id AND t.user_id = auth.uid())
        )
      );
  END IF;

  IF to_regclass('public.join_requests') IS NOT NULL THEN
    DROP POLICY IF EXISTS "join_requests_select_team_members" ON public.join_requests;
    CREATE POLICY "join_requests_select_team_members"
      ON public.join_requests FOR SELECT TO authenticated
      USING (
        status = 'accepted'
        AND type = 'application'
        AND EXISTS (SELECT 1 FROM public.team_members tm
                    WHERE tm.team_id = join_requests.team_id AND tm.user_id = auth.uid())
      );
  END IF;
END $$;

DO $$
DECLARE
  tbl text;
BEGIN
  FOREACH tbl IN ARRAY ARRAY[
    'notifications', 'push_subscriptions', 'team_messages', 'kudos',
    'join_requests', 'contact_requests', 'profile_discord_usernames', 'team_discord_links'
  ] LOOP
    IF to_regclass('public.' || tbl) IS NULL THEN
      CONTINUE;
    END IF;
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', tbl);
    -- Any open policy (USING true or WITH CHECK true), whatever the command.
    PERFORM pg_temp.drop_open_policies(tbl, false);
    EXECUTE format('REVOKE SELECT, TRUNCATE, TRIGGER, REFERENCES ON TABLE public.%I FROM anon', tbl);
    EXECUTE format('REVOKE TRUNCATE, TRIGGER, REFERENCES ON TABLE public.%I FROM authenticated', tbl);
  END LOOP;
END $$;

-- ===========================================================================
-- 8. Aggregate-only RPCs that replace broad reads
-- ===========================================================================
-- Landing-page counter.
CREATE OR REPLACE FUNCTION public.count_onboarded_jammers()
RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT count(*)::integer FROM public.profiles WHERE has_completed_onboarding IS TRUE;
$$;
REVOKE ALL ON FUNCTION public.count_onboarded_jammers() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.count_onboarded_jammers() TO anon, authenticated, service_role;

-- Monthly kudos leaderboard: totals per receiver the caller may see, never who
-- sent them.
CREATE OR REPLACE FUNCTION public.get_kudos_leaderboard(p_since timestamptz, p_limit integer DEFAULT 10)
RETURNS TABLE (receiver_id uuid, total integer)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT k.receiver_id, count(*)::integer AS total
  FROM public.kudos k
  WHERE k.created_at >= COALESCE(p_since, now() - interval '31 days')
    AND public.can_view_profile(k.receiver_id)
  GROUP BY k.receiver_id
  ORDER BY total DESC, k.receiver_id
  LIMIT LEAST(GREATEST(COALESCE(p_limit, 10), 1), 50);
$$;
REVOKE ALL ON FUNCTION public.get_kudos_leaderboard(timestamptz, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_kudos_leaderboard(timestamptz, integer) TO anon, authenticated, service_role;
