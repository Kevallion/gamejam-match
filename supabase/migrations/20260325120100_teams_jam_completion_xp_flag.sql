-- One-time TEAM_COMPLETED XP claim per squad (owner only, enforced in app via service role).

ALTER TABLE public.teams
  ADD COLUMN IF NOT EXISTS jam_completion_xp_claimed boolean NOT NULL DEFAULT false;
