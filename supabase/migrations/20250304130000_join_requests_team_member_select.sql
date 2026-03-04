-- Allow accepted squad members to see each other's join_requests
-- so that roles (target_role) and display names can be shown in squad space.

ALTER TABLE IF EXISTS public.join_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "join_requests_select_team_members" ON public.join_requests;

CREATE POLICY "join_requests_select_team_members"
  ON public.join_requests
  FOR SELECT
  USING (
    status = 'accepted'
    AND type = 'application'
    AND EXISTS (
      SELECT 1
      FROM public.team_members tm
      WHERE tm.team_id = team_id
        AND tm.user_id = auth.uid()
    )
  );

