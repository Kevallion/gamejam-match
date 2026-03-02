-- Ajouter les colonnes à la table profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS experience_level TEXT,
ADD COLUMN IF NOT EXISTS jam_style TEXT;

-- Ajouter les colonnes à la table teams
ALTER TABLE teams 
ADD COLUMN IF NOT EXISTS experience_required TEXT,
ADD COLUMN IF NOT EXISTS team_vibe TEXT;
