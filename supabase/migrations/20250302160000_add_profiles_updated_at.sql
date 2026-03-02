-- Add updated_at to profiles for ordering (newest first on Find Members)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Backfill: set updated_at = now() for existing rows
UPDATE public.profiles SET updated_at = now() WHERE updated_at IS NULL;

-- Trigger to auto-update updated_at on row change
CREATE OR REPLACE FUNCTION public.profiles_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS profiles_updated_at_trigger ON public.profiles;
CREATE TRIGGER profiles_updated_at_trigger
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.profiles_updated_at();
