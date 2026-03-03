-- Add has_completed_onboarding to profiles for onboarding modal
-- Default false for new users; existing users will have NULL (treated as "not completed")
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS has_completed_onboarding BOOLEAN DEFAULT false;
