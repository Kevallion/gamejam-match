-- Ensure the optional Discord username column exists on profiles.
-- This fixes profile settings saves on environments where the earlier
-- migration was not applied.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS discord_username text;
