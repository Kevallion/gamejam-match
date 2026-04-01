-- At most one pending join_request per (team_id, sender_id).
-- Applications: sender_id = applicant. Invitations: sender_id = invitee (see invite-actions).
-- Prevents duplicate pending applications and duplicate pending squad invites.

DELETE FROM public.join_requests j
WHERE j.id IN (
  SELECT d.id
  FROM (
    SELECT id,
           ROW_NUMBER() OVER (
             PARTITION BY team_id, sender_id
             ORDER BY created_at ASC NULLS LAST, id ASC
           ) AS rn
    FROM public.join_requests
    WHERE status = 'pending'
  ) d
  WHERE d.rn > 1
);

CREATE UNIQUE INDEX IF NOT EXISTS join_requests_one_pending_per_team_sender
  ON public.join_requests (team_id, sender_id)
  WHERE (status = 'pending');
