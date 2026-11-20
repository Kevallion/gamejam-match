-- S7: close API reads on profiles and on the tables around them
-- (Forge audit, 20 Nov 2026; scope extended and visibility rule decided by
-- Wisllor the same day: "a profile is public no matter what, except for people
-- who are not logged in").
--
-- Access model
--   anon (not signed in):
--     * no row and no column of profiles, user_badges, profile_roles,
--       team_members, availability_posts;
--     * teams listing readable, except teams.discord_link (no roster: team_members
--       stays closed, member counts come from get_team_member_counts());
--     * private tables: nothing;
--     * RPCs: count_onboarded_jammers() and get_team_member_counts() (counts
--       only, no names or user ids), and get_public_availability_posts():
--       active availability posts for /find-members, card fields only (post id,
--       author id, availability text, dates, pseudo, avatar, role, level, jam
--       style, engine, language, programming languages). Public profiles
--       (/jammer/<id>) and the Directory stay signed-in only.
--   authenticated:
--     * every profile, public columns only (column-level GRANT); never
--       discord_username or the technical columns;
--     * every user_badges / profile_roles / team_members row;
--     * active availability posts (expires_at > now()), without the profile
--       copies stored on them; plus all of their own posts;
--     * discord_username only via get_visible_discord_usernames(): self and
--       people sharing a squad with the caller (owner or member on both
--       sides), nothing else;
--     * squad Discord invite only via get_team_discord_link() / team_discord_links
--       (owner and members);
--     * private tables: per-user policies only (no USING/WITH CHECK true).
--   owner: same as authenticated, plus INSERT/UPDATE/DELETE of their own rows
--     (existing policies, unchanged), and their own S3 email preferences via
--     get_my_email_preferences() (the columns are not selectable directly).
--
-- service_role (admin client) is unaffected: it bypasses RLS and keeps its
-- table privileges. No row is inserted, updated or deleted by this migration.
-- Idempotent: safe to run more than once.

-- ===========================================================================
-- 1. Helpers
-- ===========================================================================

-- Lookups used by get_visible_discord_usernames / owner post queries
-- (no-ops when they already exist).
CREATE INDEX IF NOT EXISTS idx_availability_posts_user_expires ON public.availability_posts (user_id, expires_at);
CREATE INDEX IF NOT EXISTS idx_teams_user_id ON public.teams (user_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON public.team_members (user_id);
CREATE INDEX IF NOT EXISTS idx_join_requests_sender_id ON public.join_requests (sender_id);

-- Drops every policy granted to the API roles whose USING (or, when
-- p_read_only is false, WITH CHECK) is a bare `true`. Prod may have
-- dashboard-created ones with other names. Session-local, not kept.
CREATE OR REPLACE FUNCTION pg_temp.drop_open_policies(p_table text, p_read_only boolean)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  pol record;
BEGIN
  FOR pol IN
    SELECT policyname, cmd
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
-- 2. profiles: signed-in users only, public columns only
-- ===========================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Replaces "profiles_select_all" (USING true, every role) and any other open
-- read policy.
DROP POLICY IF EXISTS "profiles_select_all" ON public.profiles;
DO $$ BEGIN PERFORM pg_temp.drop_open_policies('profiles', true); END $$;
DROP POLICY IF EXISTS profiles_select_authenticated ON public.profiles;
CREATE POLICY profiles_select_authenticated
  ON public.profiles FOR SELECT TO authenticated
  USING (true);
-- No SELECT policy for anon. INSERT / UPDATE / DELETE policies (owner only)
-- are unchanged.

-- Column privileges. A column-level REVOKE has no effect while a table-level
-- SELECT exists, so: revoke table SELECT, clear every column SELECT, then grant
-- the listed columns to authenticated only. Missing columns are skipped.
REVOKE SELECT ON TABLE public.profiles FROM anon, authenticated;
REVOKE TRUNCATE, TRIGGER, REFERENCES ON TABLE public.profiles FROM anon, authenticated;
-- anon never writes profiles (the policies already require auth.uid()).
REVOKE INSERT, UPDATE, DELETE ON TABLE public.profiles FROM anon;

DO $$
DECLARE
  -- Public profile columns: shown to signed-in users on Directory, Available,
  -- /jammer, squads, chat and notifications, or used as filters.
  public_cols text[] := ARRAY[
    'id', 'username', 'avatar_url', 'bio',
    'role', 'main_role', 'default_role',
    'experience', 'experience_level', 'jam_style',
    'engine', 'default_engine', 'language', 'default_language',
    'portfolio_link', 'portfolio_url', 'programming_languages',
    'xp', 'current_title', 'jam_id', 'has_completed_onboarding'
  ];
  -- Read by the owner's own screens through the user session (dashboard,
  -- gamification). Column grants are not per row, so signed-in users can also
  -- read these on other profiles; they are low sensitivity.
  -- email_team_activity / email_matching_announcements (S3) are deliberately
  -- NOT listed: owner only, through get_my_email_preferences() (section 9).
  -- The loop below also removes the SELECT that migration 20261120120000
  -- grants on them to authenticated.
  authenticated_extra_cols text[] := ARRAY['onboarding_version', 'unlocked_titles'];
  col record;
BEGIN
  FOR col IN
    SELECT a.attname FROM pg_attribute a
    WHERE a.attrelid = 'public.profiles'::regclass AND a.attnum > 0 AND NOT a.attisdropped
  LOOP
    EXECUTE format('REVOKE SELECT (%I) ON TABLE public.profiles FROM anon, authenticated', col.attname);
    IF col.attname = ANY (public_cols) OR col.attname = ANY (authenticated_extra_cols) THEN
      EXECUTE format('GRANT SELECT (%I) ON TABLE public.profiles TO authenticated', col.attname);
    END IF;
  END LOOP;
END $$;
-- Never readable through the API (whatever the row policy): discord_username
-- (only via get_visible_discord_usernames), last_chat_email_sent,
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
      -- Same squad (owner or member on both sides). Nothing else: an accepted
      -- application or invitation alone does not reveal the handle (Wisllor,
      -- 20 Nov 2026: "the Discord handle is only visible to people in the same
      -- squad").
      OR EXISTS (
        SELECT 1 FROM public.teams t
        WHERE (t.user_id = me.id
               OR EXISTS (SELECT 1 FROM public.team_members a WHERE a.team_id = t.id AND a.user_id = me.id))
          AND (t.user_id = w.id
               OR EXISTS (SELECT 1 FROM public.team_members b WHERE b.team_id = t.id AND b.user_id = w.id))
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
-- 4. teams: listing stays public (anon too), minus discord_link
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
-- 5. availability_posts: signed-in users, active posts, no profile copies
-- ===========================================================================
-- anon gets nothing: without profiles a post is only a user id and dates.
ALTER TABLE public.availability_posts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "availability_posts_select_all" ON public.availability_posts;
DO $$ BEGIN PERFORM pg_temp.drop_open_policies('availability_posts', true); END $$;
DROP POLICY IF EXISTS availability_posts_select_active ON public.availability_posts;
DROP POLICY IF EXISTS availability_posts_select_own ON public.availability_posts;

CREATE POLICY availability_posts_select_active
  ON public.availability_posts FOR SELECT TO authenticated
  USING (expires_at > now());

CREATE POLICY availability_posts_select_own
  ON public.availability_posts FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- Profile copies stored on posts are no longer readable (the app reads the
-- profile instead). The data itself is left untouched.
REVOKE SELECT ON TABLE public.availability_posts FROM anon, authenticated;
REVOKE TRUNCATE, TRIGGER, REFERENCES ON TABLE public.availability_posts FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON TABLE public.availability_posts FROM anon;
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
    EXECUTE format('REVOKE SELECT (%I) ON TABLE public.availability_posts FROM anon, authenticated', col.attname);
    IF NOT (col.attname = ANY (copied_cols)) THEN
      EXECUTE format('GRANT SELECT (%I) ON TABLE public.availability_posts TO authenticated', col.attname);
    END IF;
  END LOOP;
END $$;

-- ===========================================================================
-- 6. user_badges, profile_roles, team_members: same rule as profiles
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
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', tbl || '_select_authenticated', tbl);
    EXECUTE format(
      'CREATE POLICY %I ON public.%I FOR SELECT TO authenticated USING (true)',
      tbl || '_select_authenticated', tbl);
    EXECUTE format('REVOKE SELECT, TRUNCATE, TRIGGER, REFERENCES ON TABLE public.%I FROM anon', tbl);
    EXECUTE format('REVOKE TRUNCATE, TRIGGER, REFERENCES ON TABLE public.%I FROM authenticated', tbl);
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
-- 8. Aggregate-only RPCs
-- ===========================================================================
-- Landing-page counter: a number only, callable by anon.
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

-- Monthly kudos leaderboard: totals per receiver, never who sent them.
-- Signed-in users only (it names jammers); returns nothing without a session.
CREATE OR REPLACE FUNCTION public.get_kudos_leaderboard(p_since timestamptz, p_limit integer DEFAULT 10)
RETURNS TABLE (receiver_id uuid, total integer)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT k.receiver_id, count(*)::integer AS total
  FROM public.kudos k
  WHERE auth.uid() IS NOT NULL
    AND k.created_at >= COALESCE(p_since, now() - interval '31 days')
  GROUP BY k.receiver_id
  ORDER BY total DESC, k.receiver_id
  LIMIT LEAST(GREATEST(COALESCE(p_limit, 10), 1), 50);
$$;
REVOKE ALL ON FUNCTION public.get_kudos_leaderboard(timestamptz, integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_kudos_leaderboard(timestamptz, integer) TO authenticated, service_role;

-- Per-jammer kudos counts (Directory / Available cards, dashboard): linked to
-- profiles, so signed-in users only, like the profiles themselves.
DO $$
BEGIN
  IF to_regprocedure('public.get_kudos_counts_for_users(uuid[])') IS NOT NULL THEN
    REVOKE ALL ON FUNCTION public.get_kudos_counts_for_users(uuid[]) FROM PUBLIC, anon;
    GRANT EXECUTE ON FUNCTION public.get_kudos_counts_for_users(uuid[]) TO authenticated, service_role;
  END IF;
END $$;

-- ===========================================================================
-- 9. Owner-only email preferences, public member counts
-- ===========================================================================
-- S3 email preferences of the caller only. Column SELECT on them is revoked for
-- anon and authenticated (section 2); UPDATE stays (policy profiles_update_own),
-- so the app updates without RETURNING and reads back through this function.
-- plpgsql so it can be created before the S3 columns exist; calling it then
-- raises undefined_column (42703), which the app treats as "unavailable".
CREATE OR REPLACE FUNCTION public.get_my_email_preferences()
RETURNS TABLE (email_team_activity boolean, email_matching_announcements boolean)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN;
  END IF;
  RETURN QUERY
    SELECT p.email_team_activity, p.email_matching_announcements
    FROM public.profiles p
    WHERE p.id = auth.uid();
END;
$$;
REVOKE ALL ON FUNCTION public.get_my_email_preferences() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_my_email_preferences() TO authenticated, service_role;

-- Recruited members per squad (rows of team_members; the owner is not counted,
-- the UI adds 1 for the captain). No names, no user ids: readable by anon so
-- signed-out visitors see correct "x/y filled" counts.
CREATE OR REPLACE FUNCTION public.get_team_member_counts(p_team_ids uuid[])
RETURNS TABLE (team_id uuid, member_count integer)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  WITH wanted AS (
    SELECT DISTINCT u AS id
    FROM unnest(COALESCE(p_team_ids, ARRAY[]::uuid[])) AS u
    WHERE u IS NOT NULL
    LIMIT 200
  )
  SELECT t.id, (SELECT count(*)::integer FROM public.team_members tm WHERE tm.team_id = t.id)
  FROM public.teams t
  JOIN wanted w ON w.id = t.id;
$$;
REVOKE ALL ON FUNCTION public.get_team_member_counts(uuid[]) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_team_member_counts(uuid[]) TO anon, authenticated, service_role;

-- Active availability posts for signed-out visitors on /find-members (Wisllor,
-- 20 Nov 2026: "someone not signed in can see the availability posts in Members
-- and the teams, but cannot open public profiles"). Same filters, order and
-- pagination as getAvailablePlayers (lib/queries.ts). Returns only what the card
-- needs: the post (id, author id, availability text, dates) and the author's
-- pseudo, avatar and card tags (role, level, jam style, engine, language,
-- programming languages). Never bio, portfolio, discord_username, xp/title,
-- kudos, jam, email_* or activity columns, and never the copies stored on the
-- post. profiles / availability_posts stay closed to anon.
-- p_experience takes the already-expanded legacy equivalents
-- (e.g. {regular,confirmed}); p_limit is capped at 101 (page of 100 + 1 to
-- detect "has more").
DROP FUNCTION IF EXISTS public.get_public_availability_posts(text, text, text, text[], text, text, uuid, integer, integer);
CREATE FUNCTION public.get_public_availability_posts(
  p_search text DEFAULT NULL,
  p_role text DEFAULT NULL,
  p_engine text DEFAULT NULL,
  p_experience text[] DEFAULT NULL,
  p_language text DEFAULT NULL,
  p_programming_language text DEFAULT NULL,
  p_jam_id uuid DEFAULT NULL,
  p_offset integer DEFAULT 0,
  p_limit integer DEFAULT 25
)
RETURNS TABLE (
  post_id uuid,
  user_id uuid,
  availability text,
  created_at timestamptz,
  updated_at timestamptz,
  expires_at timestamptz,
  username text,
  avatar_url text,
  role text,
  experience text,
  jam_style text,
  engine text,
  language text,
  programming_languages text[]
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT
    ap.id,
    ap.user_id,
    ap.availability::text,
    ap.created_at,
    ap.updated_at,
    ap.expires_at,
    p.username::text,
    p.avatar_url::text,
    COALESCE(NULLIF(btrim(p.role::text), ''), NULLIF(btrim(p.default_role::text), ''), NULLIF(btrim(p.main_role::text), '')),
    COALESCE(NULLIF(btrim(p.experience::text), ''), NULLIF(btrim(p.experience_level::text), '')),
    NULLIF(btrim(p.jam_style::text), ''),
    COALESCE(NULLIF(btrim(p.engine::text), ''), NULLIF(btrim(p.default_engine::text), '')),
    COALESCE(NULLIF(btrim(p.language::text), ''), NULLIF(btrim(p.default_language::text), '')),
    COALESCE(p.programming_languages, ARRAY[]::text[])
  FROM public.availability_posts ap
  JOIN public.profiles p ON p.id = ap.user_id
  WHERE ap.expires_at > pg_catalog.now()
    AND ap.availability IS NOT NULL
    AND ap.availability <> ''
    AND (NULLIF(btrim(p_search), '') IS NULL
         OR pg_catalog.strpos(pg_catalog.lower(p.username), pg_catalog.lower(btrim(p_search))) > 0)
    AND (p_jam_id IS NULL OR p.jam_id = p_jam_id)
    AND (NULLIF(btrim(p_role), '') IS NULL
         OR btrim(p_role) IN (p.role, p.default_role, p.main_role))
    AND (NULLIF(btrim(p_engine), '') IS NULL
         OR btrim(p_engine) IN (p.engine, p.default_engine))
    AND (p_experience IS NULL OR pg_catalog.cardinality(p_experience) = 0
         OR p.experience = ANY (p_experience) OR p.experience_level = ANY (p_experience))
    AND (NULLIF(btrim(p_language), '') IS NULL
         OR btrim(p_language) IN (p.language, p.default_language))
    AND (NULLIF(btrim(p_programming_language), '') IS NULL
         OR p.programming_languages @> ARRAY[btrim(p_programming_language)])
  ORDER BY ap.updated_at DESC NULLS LAST, ap.id
  OFFSET GREATEST(COALESCE(p_offset, 0), 0)
  LIMIT LEAST(GREATEST(COALESCE(p_limit, 25), 1), 101);
$$;
REVOKE ALL ON FUNCTION public.get_public_availability_posts(text, text, text, text[], text, text, uuid, integer, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_public_availability_posts(text, text, text, text[], text, text, uuid, integer, integer) TO anon, authenticated, service_role;
