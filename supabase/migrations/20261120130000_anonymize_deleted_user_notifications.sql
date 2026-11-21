-- S6 (RGPD): anonymize a deleted account in other members' notifications.
--
-- notifications.message bakes the sender's username at the start of the text, e.g.
--   "<name> applied to your squad "<team>"."            (application_received)
--   "<name> has officially joined your squad!"          (player_joined)
--   "<name> left your squad."                           (member_left)
--   "Player <name> declined your invitation to join the squad." (invitation_declined)
-- (older rows say "team" instead of "squad"). notifications.sender_id is
-- ON DELETE SET NULL, so deleting the profile used to drop the link but keep the name.
--
-- This BEFORE DELETE trigger on public.profiles runs before the FK actions
-- (CASCADE / SET NULL) fire, including when the profile is removed through the
-- auth.users -> profiles cascade (auth.admin.deleteUser or the Supabase dashboard).
-- For every notification sent by the deleted user to someone else it:
--   * replaces the leading "<name> " or "Player <name> " with "A deleted user ";
--     only the leading position is rewritten, so a team name or free text that
--     happens to contain the same word is never touched;
--   * clears sender_id.
-- The deleted user's own notifications are removed by the existing cascade.
-- team_messages are intentionally untouched (decision 20 Nov: keep the cascade delete).
-- Rows created before sender_id existed (and not backfilled) cannot be linked
-- to the account and are left as is.
--
-- The app does the same rewrite in deleteUserAccount before calling
-- auth.admin.deleteUser, so both paths produce identical text.

CREATE OR REPLACE FUNCTION public.anonymize_deleted_user_notifications()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_name text := btrim(COALESCE(OLD.username, ''));
  v_player_prefix text := 'Player ' || btrim(COALESCE(OLD.username, '')) || ' ';
  v_name_prefix text := btrim(COALESCE(OLD.username, '')) || ' ';
BEGIN
  UPDATE public.notifications AS n
  SET
    sender_id = NULL,
    message = CASE
      WHEN v_name = '' THEN n.message
      WHEN left(n.message, length(v_player_prefix)) = v_player_prefix
        THEN 'A deleted user ' || substr(n.message, length(v_player_prefix) + 1)
      WHEN left(n.message, length(v_name_prefix)) = v_name_prefix
        THEN 'A deleted user ' || substr(n.message, length(v_name_prefix) + 1)
      ELSE n.message
    END
  WHERE n.sender_id = OLD.id
    AND n.user_id <> OLD.id;

  RETURN OLD;
END;
$$;

COMMENT ON FUNCTION public.anonymize_deleted_user_notifications() IS
  'S6: BEFORE DELETE on profiles. Replaces the deleted user''s leading username with "A deleted user" in notifications sent to other users and clears sender_id.';

-- Trigger-only function: nobody calls it directly. Owned by the migration role (postgres).
REVOKE ALL ON FUNCTION public.anonymize_deleted_user_notifications() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.anonymize_deleted_user_notifications() FROM anon;
REVOKE ALL ON FUNCTION public.anonymize_deleted_user_notifications() FROM authenticated;

DROP TRIGGER IF EXISTS profiles_anonymize_deleted_user_notifications ON public.profiles;
CREATE TRIGGER profiles_anonymize_deleted_user_notifications
  BEFORE DELETE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.anonymize_deleted_user_notifications();
