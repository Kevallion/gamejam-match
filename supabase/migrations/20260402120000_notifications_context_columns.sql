-- Rich context for in-app notifications (sender, team, join request)
ALTER TABLE public.notifications
  ADD COLUMN IF NOT EXISTS sender_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS team_id uuid REFERENCES public.teams(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS join_request_id uuid REFERENCES public.join_requests(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_notifications_join_request_id
  ON public.notifications (join_request_id)
  WHERE join_request_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_notifications_team_id
  ON public.notifications (team_id)
  WHERE team_id IS NOT NULL;
