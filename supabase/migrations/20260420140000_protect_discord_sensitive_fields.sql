-- Private Discord invite links: only squad owner/members can read
CREATE TABLE IF NOT EXISTS public.team_discord_links (
  team_id uuid PRIMARY KEY REFERENCES public.teams(id) ON DELETE CASCADE,
  discord_link text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.team_discord_links ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_team_owner_or_member(p_team_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    EXISTS (
      SELECT 1 FROM public.teams t
      WHERE t.id = p_team_id AND t.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.team_members tm
      WHERE tm.team_id = p_team_id AND tm.user_id = auth.uid()
    );
$$;

REVOKE ALL ON FUNCTION public.is_team_owner_or_member(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_team_owner_or_member(uuid) TO authenticated;

DROP POLICY IF EXISTS team_discord_links_select_members ON public.team_discord_links;
CREATE POLICY team_discord_links_select_members
  ON public.team_discord_links
  FOR SELECT
  TO authenticated
  USING (public.is_team_owner_or_member(team_id));

DROP POLICY IF EXISTS team_discord_links_insert_owner ON public.team_discord_links;
CREATE POLICY team_discord_links_insert_owner
  ON public.team_discord_links
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.teams t
      WHERE t.id = team_id AND t.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS team_discord_links_update_owner ON public.team_discord_links;
CREATE POLICY team_discord_links_update_owner
  ON public.team_discord_links
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.teams t
      WHERE t.id = team_id AND t.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.teams t
      WHERE t.id = team_id AND t.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS team_discord_links_delete_owner ON public.team_discord_links;
CREATE POLICY team_discord_links_delete_owner
  ON public.team_discord_links
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.teams t
      WHERE t.id = team_id AND t.user_id = auth.uid()
    )
  );

-- Copy only when the legacy public column still exists (fresh databases and
-- environments that already dropped it must both succeed). A later migration
-- adds teams.discord_link back as a nullable column for schema parity.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'teams'
      AND column_name = 'discord_link'
  ) THEN
    INSERT INTO public.team_discord_links (team_id, discord_link)
    SELECT id, discord_link
    FROM public.teams
    WHERE discord_link IS NOT NULL AND btrim(discord_link) <> ''
    ON CONFLICT (team_id) DO UPDATE
    SET discord_link = EXCLUDED.discord_link, updated_at = now();
  END IF;
END $$;

ALTER TABLE public.teams DROP COLUMN IF EXISTS discord_link;

REVOKE SELECT (discord_username) ON TABLE public.profiles FROM anon;

UPDATE public.teams
SET game_name = 'Open project'
WHERE lower(btrim(game_name)) IN ('[suggest a project]', 'suggest a project');

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.team_discord_links TO authenticated;
