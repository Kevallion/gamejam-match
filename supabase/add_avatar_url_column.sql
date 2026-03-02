-- ============================================================================
-- Script pour ajouter la colonne avatar_url à la table profiles
-- Exécuter dans le SQL Editor de Supabase (Dashboard > SQL Editor)
-- ============================================================================
-- Ordre de priorité d'affichage : profiles.avatar_url > Discord > initiales
-- ============================================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'profiles'
      AND column_name = 'avatar_url'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN avatar_url TEXT;
    RAISE NOTICE 'Colonne avatar_url ajoutée avec succès.';
  ELSE
    RAISE NOTICE 'La colonne avatar_url existe déjà.';
  END IF;
END $$;
