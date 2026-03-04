-- Mini chat d'équipe : stockage des messages par équipe
CREATE TABLE IF NOT EXISTS public.team_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- RLS : seuls les membres acceptés (team_members) ou le leader (teams.user_id)
-- peuvent lire ou écrire des messages pour une équipe donnée.
ALTER TABLE public.team_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "team_messages_select_team_members_only" ON public.team_messages;
DROP POLICY IF EXISTS "team_messages_insert_team_members_only" ON public.team_messages;

CREATE POLICY "team_messages_select_team_members_only"
  ON public.team_messages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.team_members tm
      WHERE tm.team_id = team_id
        AND tm.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1
      FROM public.teams t
      WHERE t.id = team_id
        AND t.user_id = auth.uid()
    )
  );

CREATE POLICY "team_messages_insert_team_members_only"
  ON public.team_messages
  FOR INSERT
  WITH CHECK (
    sender_id = auth.uid()
    AND (
      EXISTS (
        SELECT 1
        FROM public.team_members tm
        WHERE tm.team_id = team_id
          AND tm.user_id = auth.uid()
      )
      OR EXISTS (
        SELECT 1
        FROM public.teams t
        WHERE t.id = team_id
          AND t.user_id = auth.uid()
      )
    )
  );

-- Activer la diffusion Realtime sur cette table
ALTER PUBLICATION supabase_realtime ADD TABLE public.team_messages;

