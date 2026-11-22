-- DIR-1 (22 Nov 2026): the members directory lists every onboarded profile
-- again, except the ones that opt out. Since e8262020 (PR #28)
-- getDirectoryJammers only kept profiles with an active availability post.
--
-- profiles.directory_visible: true by default (existing rows included), set to
-- false by the owner through setDirectoryVisibility() (Settings, DIR-2).
--
-- Privileges (S7 lockdown, 20261120140000): profiles SELECT is per column and a
-- new column is not readable until granted, so SELECT (directory_visible) is
-- granted to authenticated only (the directory filters on it). UPDATE stays the
-- table-level privilege authenticated already has, limited to the caller's own
-- row by the owner-only UPDATE policy (auth.uid() = id). Nothing for anon:
-- anon has no SELECT/UPDATE on profiles and keeps none. No policy change.
-- Idempotent.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS directory_visible boolean NOT NULL DEFAULT true;

-- In case the column pre-existed without the constraint/default.
UPDATE public.profiles SET directory_visible = true WHERE directory_visible IS NULL;
ALTER TABLE public.profiles ALTER COLUMN directory_visible SET DEFAULT true;
ALTER TABLE public.profiles ALTER COLUMN directory_visible SET NOT NULL;

COMMENT ON COLUMN public.profiles.directory_visible IS
  'DIR-1: listed in the members directory (signed-in users) when true. Owner-controlled.';

REVOKE ALL (directory_visible) ON TABLE public.profiles FROM anon;
GRANT SELECT (directory_visible) ON TABLE public.profiles TO authenticated;

-- Directory query: onboarded and visible, ordered by username.
CREATE INDEX IF NOT EXISTS profiles_directory_visible_username_idx
  ON public.profiles (username)
  WHERE has_completed_onboarding AND directory_visible;