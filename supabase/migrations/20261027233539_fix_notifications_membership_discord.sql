-- Production-safe follow-ups from end-to-end testing.
-- This migration is NOT applied automatically. Apply it to the linked database
-- (supabase db push / migration up) before the new behavior is fully enforced there.
--
-- 1. One membership row per jammer per squad.
-- 2. Block inviting or applying when that jammer is already on the squad.
--    Full squads stay invitable: there is no capacity check here.
-- 3. Drop stray triggers that insert notifications (email local-part leaks / duplicates).
-- 4. One notification per join / accept / decline event, and rewrite stored email-looking names.
-- 5. Teammate-only Discord usernames.
-- 6. Keep teams.discord_link present for schema parity (invite URLs stay in team_discord_links).
-- 7. Jam Champion is a public badge, not only a title.

-- ---------------------------------------------------------------------------
-- team_members uniqueness
-- ---------------------------------------------------------------------------
DELETE FROM public.team_members a
USING public.team_members b
WHERE a.team_id = b.team_id
  AND a.user_id = b.user_id
  AND a.ctid > b.ctid;

CREATE UNIQUE INDEX IF NOT EXISTS team_members_team_user_unique
  ON public.team_members (team_id, user_id);

-- ---------------------------------------------------------------------------
-- Reject join_requests for someone already on the squad (owner or member).
-- Does not look at open slots or squad size.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.reject_join_request_for_existing_member()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.type IN ('invitation', 'application') THEN
    IF EXISTS (
      SELECT 1
      FROM public.team_members tm
      WHERE tm.team_id = NEW.team_id
        AND tm.user_id = NEW.sender_id
    ) OR EXISTS (
      SELECT 1
      FROM public.teams t
      WHERE t.id = NEW.team_id
        AND t.user_id = NEW.sender_id
    ) THEN
      RAISE EXCEPTION 'This jammer is already a member of this squad.'
        USING ERRCODE = '23514';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS join_requests_reject_existing_member ON public.join_requests;
CREATE TRIGGER join_requests_reject_existing_member
  BEFORE INSERT ON public.join_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.reject_join_request_for_existing_member();

-- Reaffirm one pending request per (team, sender). Safe if the index already exists.
CREATE UNIQUE INDEX IF NOT EXISTS join_requests_one_pending_per_team_sender
  ON public.join_requests (team_id, sender_id)
  WHERE (status = 'pending');

-- ---------------------------------------------------------------------------
-- Drop notification-writing triggers on squad tables (not present in this repo,
-- but observed in production: duplicate join / accept rows, one using the
-- email local part).
-- ---------------------------------------------------------------------------
DO $$
DECLARE
  r record;
BEGIN
  FOR r IN
    SELECT tg.tgname AS trigger_name, c.relname AS table_name
    FROM pg_trigger tg
    JOIN pg_class c ON c.oid = tg.tgrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    JOIN pg_proc p ON p.oid = tg.tgfoid
    WHERE n.nspname = 'public'
      AND NOT tg.tgisinternal
      AND c.relname IN ('join_requests', 'team_members', 'teams')
      AND tg.tgname <> 'join_requests_reject_existing_member'
      AND (
        pg_get_functiondef(p.oid) ILIKE '%notifications%'
        OR pg_get_functiondef(p.oid) ILIKE '%split_part%'
        OR pg_get_functiondef(p.oid) ILIKE '%auth.users%'
      )
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS %I ON public.%I', r.trigger_name, r.table_name);
  END LOOP;
END $$;

-- Rewrite leaked email local-parts when we know the profile username.
UPDATE public.notifications n
SET message = p.username || ' has officially joined your team!'
FROM public.profiles p
WHERE n.type = 'player_joined'
  AND n.sender_id = p.id
  AND NULLIF(btrim(p.username), '') IS NOT NULL
  AND p.username !~ '[@+]'
  AND n.message ~ '[@+]';

UPDATE public.notifications n
SET message = 'Player ' || p.username || ' declined your invitation to join the team.'
FROM public.profiles p
WHERE n.type = 'invitation_declined'
  AND n.sender_id = p.id
  AND NULLIF(btrim(p.username), '') IS NOT NULL
  AND p.username !~ '[@+]'
  AND n.message ~ '[@+]';

UPDATE public.notifications n
SET message = p.username || ' applied to your team "' || COALESCE(t.team_name, 'your squad') || '".'
FROM public.profiles p
LEFT JOIN public.teams t ON t.id = n.team_id
WHERE n.type = 'application_received'
  AND n.sender_id = p.id
  AND NULLIF(btrim(p.username), '') IS NOT NULL
  AND p.username !~ '[@+]'
  AND n.message ~ '[@+]';

-- Drop "applied" rows left behind after the applicant cancelled (request deleted, FK set null).
DELETE FROM public.notifications n
WHERE n.type = 'application_received'
  AND (
    n.join_request_id IS NULL
    OR NOT EXISTS (
      SELECT 1
      FROM public.join_requests j
      WHERE j.id = n.join_request_id
    )
  );

-- Any leftover activity copy that still contains an email or plus-address local part.
UPDATE public.notifications
SET message = 'A jammer has officially joined your team!'
WHERE type = 'player_joined'
  AND message ~ '[@+]';

UPDATE public.notifications
SET message = 'A jammer declined your invitation to join the team.'
WHERE type = 'invitation_declined'
  AND message ~ '[@+]';

UPDATE public.notifications
SET message = 'A jammer applied to your team.'
WHERE type = 'application_received'
  AND message ~ '[@+]';

UPDATE public.notifications
SET message = 'A jammer left your squad.'
WHERE type = 'member_left'
  AND message ~ '[@+]';

-- Drop email-looking join notices when a clean twin exists for the same squad.
DELETE FROM public.notifications n
WHERE n.type = 'player_joined'
  AND n.message ~ '[@+]'
  AND n.team_id IS NOT NULL
  AND EXISTS (
    SELECT 1
    FROM public.notifications c
    WHERE c.user_id = n.user_id
      AND c.team_id = n.team_id
      AND c.type = 'player_joined'
      AND c.id <> n.id
      AND c.message !~ '[@+]'
  );

-- Keep one row per event (prefer a non-email message, then the newest).
WITH ranked AS (
  SELECT id,
         row_number() OVER (
           PARTITION BY user_id, team_id, type, COALESCE(sender_id, '00000000-0000-0000-0000-000000000000'::uuid)
           ORDER BY
             CASE WHEN message ~ '[@+]' THEN 1 ELSE 0 END,
             created_at DESC
         ) AS rn
  FROM public.notifications
  WHERE type IN ('player_joined', 'application_accepted', 'invitation_declined', 'member_left')
    AND team_id IS NOT NULL
)
DELETE FROM public.notifications n
USING ranked r
WHERE n.id = r.id
  AND r.rn > 1;

CREATE UNIQUE INDEX IF NOT EXISTS notifications_one_player_joined
  ON public.notifications (user_id, team_id, sender_id)
  WHERE type = 'player_joined'
    AND team_id IS NOT NULL
    AND sender_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS notifications_one_application_accepted
  ON public.notifications (user_id, team_id)
  WHERE type = 'application_accepted'
    AND team_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS notifications_one_invitation_declined
  ON public.notifications (user_id, team_id, sender_id)
  WHERE type = 'invitation_declined'
    AND team_id IS NOT NULL
    AND sender_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS notifications_one_member_left
  ON public.notifications (user_id, team_id, sender_id)
  WHERE type = 'member_left'
    AND team_id IS NOT NULL
    AND sender_id IS NOT NULL;

-- ---------------------------------------------------------------------------
-- Discord usernames visible only to the owner and people who share a squad.
-- profiles.discord_username stays writable for older clients; SELECT is revoked
-- so a broad profiles query cannot list every handle.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profile_discord_usernames (
  user_id uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  discord_username text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.profile_discord_usernames ENABLE ROW LEVEL SECURITY;

INSERT INTO public.profile_discord_usernames (user_id, discord_username)
SELECT id, NULLIF(btrim(discord_username), '')
FROM public.profiles
WHERE discord_username IS NOT NULL
  AND btrim(discord_username) <> ''
ON CONFLICT (user_id) DO UPDATE
SET discord_username = EXCLUDED.discord_username,
    updated_at = now();

DROP POLICY IF EXISTS profile_discord_usernames_select_teammates ON public.profile_discord_usernames;
CREATE POLICY profile_discord_usernames_select_teammates
  ON public.profile_discord_usernames
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1
      FROM public.team_members me
      JOIN public.team_members them ON them.team_id = me.team_id
      WHERE me.user_id = auth.uid()
        AND them.user_id = profile_discord_usernames.user_id
    )
    OR EXISTS (
      SELECT 1
      FROM public.teams t
      JOIN public.team_members tm ON tm.team_id = t.id
      WHERE t.user_id = auth.uid()
        AND tm.user_id = profile_discord_usernames.user_id
    )
    OR EXISTS (
      SELECT 1
      FROM public.teams t
      JOIN public.team_members tm ON tm.team_id = t.id
      WHERE tm.user_id = auth.uid()
        AND t.user_id = profile_discord_usernames.user_id
    )
  );

DROP POLICY IF EXISTS profile_discord_usernames_insert_self ON public.profile_discord_usernames;
CREATE POLICY profile_discord_usernames_insert_self
  ON public.profile_discord_usernames
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS profile_discord_usernames_update_self ON public.profile_discord_usernames;
CREATE POLICY profile_discord_usernames_update_self
  ON public.profile_discord_usernames
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS profile_discord_usernames_delete_self ON public.profile_discord_usernames;
CREATE POLICY profile_discord_usernames_delete_self
  ON public.profile_discord_usernames
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.profile_discord_usernames TO authenticated;

REVOKE SELECT (discord_username) ON TABLE public.profiles FROM authenticated;
REVOKE SELECT (discord_username) ON TABLE public.profiles FROM anon;

-- ---------------------------------------------------------------------------
-- teams.discord_link must exist at the end of a fresh replay.
-- Invite URLs are stored in team_discord_links, not copied back here.
-- ---------------------------------------------------------------------------
ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS discord_link text;

-- ---------------------------------------------------------------------------
-- Jam Champion badge for jammers who already unlocked the title.
-- ---------------------------------------------------------------------------
INSERT INTO public.user_badges (user_id, badge_id)
SELECT p.id, 'jam_champion'
FROM public.profiles p
WHERE COALESCE(p.unlocked_titles, '[]'::jsonb) @> '["Jam Champion"]'::jsonb
ON CONFLICT (user_id, badge_id) DO NOTHING;
