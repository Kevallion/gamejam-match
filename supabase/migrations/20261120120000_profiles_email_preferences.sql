-- S3: per-category email preferences on profiles.
-- Both default to true so existing jammers keep receiving the same emails.
-- Account / auth emails and the account-deletion confirmation are not governed by these.
--
-- Write access: the existing "profiles_update_own" RLS policy (auth.uid() = id)
-- already limits updates to the owner's row, and the gamification trigger
-- (profiles_enforce_gamification_columns) does not touch these columns.
-- Unsubscribe links are applied server-side with the service role.
--
-- Read access: profiles keeps its public SELECT policy, so these two booleans
-- are readable like the other public profile columns (accepted for S3).

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS email_team_activity boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS email_matching_announcements boolean NOT NULL DEFAULT true;

COMMENT ON COLUMN public.profiles.email_team_activity IS
  'Email opt-in for squad activity: applications, invitations and responses, joined/removed, squad chat digests, Discord links, listing ended. Default true.';
COMMENT ON COLUMN public.profiles.email_matching_announcements IS
  'Email opt-in for matching and announcements: smart match, follow-ups after posting or creating a squad, welcome email, jam broadcasts. Default true.';

-- Explicit column grants, in case table-level privileges on profiles are ever
-- narrowed to column lists. Idempotent; RLS still applies.
GRANT SELECT (email_team_activity, email_matching_announcements) ON TABLE public.profiles TO authenticated;
GRANT UPDATE (email_team_activity, email_matching_announcements) ON TABLE public.profiles TO authenticated;
