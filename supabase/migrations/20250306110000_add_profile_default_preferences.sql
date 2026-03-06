-- Add default preferences to profiles for auto-filling the availability form
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS default_role TEXT,
  ADD COLUMN IF NOT EXISTS default_engine TEXT,
  ADD COLUMN IF NOT EXISTS default_language TEXT,
  ADD COLUMN IF NOT EXISTS portfolio_url TEXT;
