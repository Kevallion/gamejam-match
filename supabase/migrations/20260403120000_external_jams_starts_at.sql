ALTER TABLE public.external_jams
  ADD COLUMN IF NOT EXISTS starts_at timestamptz;

CREATE INDEX IF NOT EXISTS idx_external_jams_starts_at ON public.external_jams(starts_at);
