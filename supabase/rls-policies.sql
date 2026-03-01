-- ============================================================================
-- GameJamCrew - RLS Policies (Row Level Security)
-- Exécuter dans le SQL Editor de Supabase (Dashboard > SQL Editor)
-- ============================================================================
-- Règles :
-- 1. Un utilisateur ne peut modifier/supprimer QUE ses propres données
-- 2. Tout le monde peut lire les équipes et les profils (lecture publique)
-- 3. Seul le chef d'équipe (user_id de teams) peut accepter/refuser une candidature
-- ============================================================================

-- Activer RLS sur toutes les tables
ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.join_requests ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- PROFILES
-- ============================================================================

-- Supprimer les anciennes policies si elles existent (pour ré-exécution idempotente)
DROP POLICY IF EXISTS "profiles_select_all" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_delete_own" ON public.profiles;

-- Lecture : tout le monde peut lire les profils (pour Find Members)
CREATE POLICY "profiles_select_all"
  ON public.profiles FOR SELECT
  USING (true);

-- Insertion : uniquement son propre profil (id = auth.uid())
CREATE POLICY "profiles_insert_own"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Mise à jour : uniquement son propre profil
CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Suppression : uniquement son propre profil
CREATE POLICY "profiles_delete_own"
  ON public.profiles FOR DELETE
  USING (auth.uid() = id);

-- ============================================================================
-- TEAMS
-- ============================================================================

DROP POLICY IF EXISTS "teams_select_all" ON public.teams;
DROP POLICY IF EXISTS "teams_insert_own" ON public.teams;
DROP POLICY IF EXISTS "teams_update_own" ON public.teams;
DROP POLICY IF EXISTS "teams_delete_own" ON public.teams;

-- Lecture : tout le monde peut lire les équipes (pour Find Teams)
CREATE POLICY "teams_select_all"
  ON public.teams FOR SELECT
  USING (true);

-- Insertion : uniquement si user_id = auth.uid()
CREATE POLICY "teams_insert_own"
  ON public.teams FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Mise à jour : uniquement le propriétaire (chef d'équipe)
CREATE POLICY "teams_update_own"
  ON public.teams FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Suppression : uniquement le propriétaire
CREATE POLICY "teams_delete_own"
  ON public.teams FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- TEAM_MEMBERS
-- ============================================================================

DROP POLICY IF EXISTS "team_members_select_all" ON public.team_members;
DROP POLICY IF EXISTS "team_members_insert_owner_or_invitee" ON public.team_members;
DROP POLICY IF EXISTS "team_members_delete_owner_or_self" ON public.team_members;

-- Lecture : tout le monde peut lire les membres (pour afficher les équipes)
CREATE POLICY "team_members_select_all"
  ON public.team_members FOR SELECT
  USING (true);

-- Insertion :
-- - Le chef d'équipe peut ajouter (quand il accepte une candidature)
-- - Un membre peut s'ajouter lui-même (quand il accepte une invitation)
CREATE POLICY "team_members_insert_owner_or_invitee"
  ON public.team_members FOR INSERT
  WITH CHECK (
    -- Soit le chef d'équipe ajoute quelqu'un
    EXISTS (
      SELECT 1 FROM public.teams t
      WHERE t.id = team_id AND t.user_id = auth.uid()
    )
    OR
    -- Soit on s'ajoute soi-même (acceptation d'invitation)
    auth.uid() = user_id
  );

-- Suppression : chef d'équipe ou le membre lui-même (retrait)
DROP POLICY IF EXISTS "team_members_delete" ON public.team_members;
CREATE POLICY "team_members_delete"
  ON public.team_members FOR DELETE
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM public.teams t
      WHERE t.id = team_id AND t.user_id = auth.uid()
    )
  );

-- Pas de UPDATE sur team_members (rôle fixe)

-- ============================================================================
-- JOIN_REQUESTS
-- ============================================================================

DROP POLICY IF EXISTS "join_requests_select_sender_or_team_owner" ON public.join_requests;
DROP POLICY IF EXISTS "join_requests_insert" ON public.join_requests;
DROP POLICY IF EXISTS "join_requests_update_team_owner_or_sender" ON public.join_requests;
DROP POLICY IF EXISTS "join_requests_delete" ON public.join_requests;

-- Lecture :
-- - Le chef d'équipe voit les candidatures (type=application) vers ses équipes
-- - Le sender voit ses propres demandes (candidatures ou invitations reçues)
CREATE POLICY "join_requests_select_sender_or_team_owner"
  ON public.join_requests FOR SELECT
  USING (
    auth.uid() = sender_id
    OR EXISTS (
      SELECT 1 FROM public.teams t
      WHERE t.id = team_id AND t.user_id = auth.uid()
    )
  );

-- Insertion :
-- - Candidature (type=application) : sender_id = auth.uid(), tout utilisateur connecté peut candidater
-- - Invitation (type=invitation) : seul le chef d'équipe peut inviter (sender_id = profile invité, on vérifie que l'utilisateur connecté est le chef)
-- Note : Pour les invitations, sender_id = le jammer invité. Le chef doit être connecté et propriétaire de l'équipe.
CREATE POLICY "join_requests_insert"
  ON public.join_requests FOR INSERT
  WITH CHECK (
    -- Candidature : je suis le sender
    (type = 'application' AND auth.uid() = sender_id)
    OR
    -- Invitation : je suis le chef de l'équipe (le sender_id est le jammer invité)
    (type = 'invitation' AND EXISTS (
      SELECT 1 FROM public.teams t
      WHERE t.id = team_id AND t.user_id = auth.uid()
    ))
  );

-- Mise à jour (accepter/refuser) :
-- - Candidature : seul le chef d'équipe peut mettre à jour (accepter/refuser)
-- - Invitation : seul le sender (jammer invité) peut accepter/refuser
CREATE POLICY "join_requests_update_team_owner_or_sender"
  ON public.join_requests FOR UPDATE
  USING (
    auth.uid() = sender_id
    OR EXISTS (
      SELECT 1 FROM public.teams t
      WHERE t.id = team_id AND t.user_id = auth.uid()
    )
  )
  WITH CHECK (
    auth.uid() = sender_id
    OR EXISTS (
      SELECT 1 FROM public.teams t
      WHERE t.id = team_id AND t.user_id = auth.uid()
    )
  );

-- Suppression : chef d'équipe ou sender (pour annuler une demande)
CREATE POLICY "join_requests_delete"
  ON public.join_requests FOR DELETE
  USING (
    auth.uid() = sender_id
    OR EXISTS (
      SELECT 1 FROM public.teams t
      WHERE t.id = team_id AND t.user_id = auth.uid()
    )
  );

-- ============================================================================
-- Vérification rapide
-- ============================================================================
-- SELECT tablename, policyname FROM pg_policies WHERE schemaname = 'public' ORDER BY tablename;
