-- Add ON DELETE CASCADE to join_requests and team_members
-- so that when a team is deleted, related rows are cleaned up automatically.
-- This prevents orphaned join_requests when a team owner deletes their team.

-- join_requests.team_id -> teams.id
-- Drop and recreate FK with CASCADE (constraint names may vary in Supabase)
ALTER TABLE public.join_requests
  DROP CONSTRAINT IF EXISTS join_requests_team_id_fkey;

ALTER TABLE public.join_requests
  ADD CONSTRAINT join_requests_team_id_fkey
  FOREIGN KEY (team_id) REFERENCES public.teams(id) ON DELETE CASCADE;

-- team_members.team_id -> teams.id
ALTER TABLE public.team_members
  DROP CONSTRAINT IF EXISTS team_members_team_id_fkey;

ALTER TABLE public.team_members
  ADD CONSTRAINT team_members_team_id_fkey
  FOREIGN KEY (team_id) REFERENCES public.teams(id) ON DELETE CASCADE;

-- Note: If your Supabase project uses different constraint names,
-- run: SELECT conname FROM pg_constraint WHERE conrelid = 'join_requests'::regclass;
-- and replace the DROP CONSTRAINT names accordingly.
