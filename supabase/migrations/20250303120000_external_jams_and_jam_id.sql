-- Table external_jams : Jams Itch.io (lecture seule côté client, écriture via service role / sync)
CREATE TABLE IF NOT EXISTS public.external_jams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  itch_id integer NOT NULL UNIQUE,
  title text,
  url text,
  thumbnail_url text,
  ends_at timestamptz
);

-- RLS : tout le monde peut lire, personne ne peut écrire via l'API client
ALTER TABLE public.external_jams ENABLE ROW LEVEL SECURITY;

-- Lecture ouverte à tous (anon + authenticated)
CREATE POLICY "external_jams_select_all"
  ON public.external_jams FOR SELECT
  USING (true);

-- Aucune policy INSERT/UPDATE/DELETE => seul le service role (backend) peut écrire

-- Colonne jam_id sur teams et profiles (FK vers external_jams)
ALTER TABLE public.teams
  ADD COLUMN IF NOT EXISTS jam_id uuid REFERENCES public.external_jams(id) ON DELETE SET NULL;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS jam_id uuid REFERENCES public.external_jams(id) ON DELETE SET NULL;

-- Index pour les jointures et les filtres
CREATE INDEX IF NOT EXISTS idx_external_jams_ends_at ON public.external_jams(ends_at);
CREATE INDEX IF NOT EXISTS idx_teams_jam_id ON public.teams(jam_id);
CREATE INDEX IF NOT EXISTS idx_profiles_jam_id ON public.profiles(jam_id);
