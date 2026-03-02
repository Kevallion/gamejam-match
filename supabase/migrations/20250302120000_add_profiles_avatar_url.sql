-- Ajoute la colonne avatar_url à la table profiles (si elle n'existe pas)
-- Cette colonne stocke l'URL de l'avatar choisi dans la galerie interne.
-- Ordre de priorité d'affichage : profiles.avatar_url > Discord (user_metadata) > initiales

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'profiles'
      AND column_name = 'avatar_url'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN avatar_url TEXT;
  END IF;
END $$;
