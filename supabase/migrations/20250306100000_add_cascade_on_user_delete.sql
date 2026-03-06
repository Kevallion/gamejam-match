-- RGPD: Ensure ON DELETE CASCADE when auth.users is deleted (account deletion).
-- This migration adds/updates FKs so that deleting a user cascades to all related data.
-- availability_posts already has user_id -> auth.users(id) ON DELETE CASCADE (20250302170000).

-- 1. profiles.id -> auth.users(id)
-- Profiles are tied to auth users; when user is deleted, profile must be removed.
-- Tables referencing profiles (notifications, push_subscriptions, team_messages, etc.) already have ON DELETE CASCADE.
-- Drop any existing FK (constraint names may vary across Supabase projects).
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN (
    SELECT conname FROM pg_constraint
    WHERE conrelid = 'public.profiles'::regclass
      AND confrelid = 'auth.users'::regclass
      AND contype = 'f'
  ) LOOP
    EXECUTE format('ALTER TABLE public.profiles DROP CONSTRAINT %I', r.conname);
  END LOOP;
END $$;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_id_fkey
  FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- 2. teams.user_id -> auth.users(id)
-- When user is deleted, their owned teams are deleted (cascades to team_members, join_requests via team_id).
ALTER TABLE public.teams
  DROP CONSTRAINT IF EXISTS teams_user_id_fkey;

ALTER TABLE public.teams
  ADD CONSTRAINT teams_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- 3. team_members.user_id -> auth.users(id)
-- When user is deleted, remove them from all teams.
ALTER TABLE public.team_members
  DROP CONSTRAINT IF EXISTS team_members_user_id_fkey;

ALTER TABLE public.team_members
  ADD CONSTRAINT team_members_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- 4. join_requests.sender_id -> auth.users(id)
-- When user is deleted, their join requests (applications/invitations) are removed.
ALTER TABLE public.join_requests
  DROP CONSTRAINT IF EXISTS join_requests_sender_id_fkey;

ALTER TABLE public.join_requests
  ADD CONSTRAINT join_requests_sender_id_fkey
  FOREIGN KEY (sender_id) REFERENCES auth.users(id) ON DELETE CASCADE;
