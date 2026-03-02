-- Add expires_at column to teams table
-- New listings default to 30 days visibility; existing rows get the same default.
ALTER TABLE public.teams
ADD COLUMN IF NOT EXISTS expires_at timestamptz
DEFAULT (now() + interval '30 days');

-- Backfill existing rows: set expires_at to created_at + 30 days if not set
UPDATE public.teams
SET expires_at = COALESCE(created_at, now()) + interval '30 days'
WHERE expires_at IS NULL;
