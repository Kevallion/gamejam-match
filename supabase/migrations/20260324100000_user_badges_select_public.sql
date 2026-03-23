-- Allow anyone (including anonymous) to read badges for public profiles.
-- Achievements are non-sensitive; profiles are already world-readable.

DROP POLICY IF EXISTS "user_badges_select_own" ON public.user_badges;
CREATE POLICY "user_badges_select_all" ON public.user_badges
  FOR SELECT
  USING (true);
