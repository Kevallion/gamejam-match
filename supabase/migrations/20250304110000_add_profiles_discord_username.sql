-- Add optional Discord username to profiles so jammers can share a handle
-- for direct contact without exposing their email address.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS discord_username text;

