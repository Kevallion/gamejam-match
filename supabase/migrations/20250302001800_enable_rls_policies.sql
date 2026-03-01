-- GameJamCrew - RLS Policies
ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.join_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_all" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_delete_own" ON public.profiles;

CREATE POLICY "profiles_select_all" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_delete_own" ON public.profiles FOR DELETE USING (auth.uid() = id);

DROP POLICY IF EXISTS "teams_select_all" ON public.teams;
DROP POLICY IF EXISTS "teams_insert_own" ON public.teams;
DROP POLICY IF EXISTS "teams_update_own" ON public.teams;
DROP POLICY IF EXISTS "teams_delete_own" ON public.teams;

CREATE POLICY "teams_select_all" ON public.teams FOR SELECT USING (true);
CREATE POLICY "teams_insert_own" ON public.teams FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "teams_update_own" ON public.teams FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "teams_delete_own" ON public.teams FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "team_members_select_all" ON public.team_members;
DROP POLICY IF EXISTS "team_members_insert_owner_or_invitee" ON public.team_members;
DROP POLICY IF EXISTS "team_members_delete_owner_or_self" ON public.team_members;
DROP POLICY IF EXISTS "team_members_delete" ON public.team_members;

CREATE POLICY "team_members_select_all" ON public.team_members FOR SELECT USING (true);
CREATE POLICY "team_members_insert_owner_or_invitee" ON public.team_members FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.teams t WHERE t.id = team_id AND t.user_id = auth.uid())
  OR auth.uid() = user_id
);
CREATE POLICY "team_members_delete" ON public.team_members FOR DELETE USING (
  auth.uid() = user_id
  OR EXISTS (SELECT 1 FROM public.teams t WHERE t.id = team_id AND t.user_id = auth.uid())
);

DROP POLICY IF EXISTS "join_requests_select_sender_or_team_owner" ON public.join_requests;
DROP POLICY IF EXISTS "join_requests_insert" ON public.join_requests;
DROP POLICY IF EXISTS "join_requests_update_team_owner_or_sender" ON public.join_requests;
DROP POLICY IF EXISTS "join_requests_delete" ON public.join_requests;

CREATE POLICY "join_requests_select_sender_or_team_owner" ON public.join_requests FOR SELECT USING (
  auth.uid() = sender_id
  OR EXISTS (SELECT 1 FROM public.teams t WHERE t.id = team_id AND t.user_id = auth.uid())
);
CREATE POLICY "join_requests_insert" ON public.join_requests FOR INSERT WITH CHECK (
  (type = 'application' AND auth.uid() = sender_id)
  OR (type = 'invitation' AND EXISTS (SELECT 1 FROM public.teams t WHERE t.id = team_id AND t.user_id = auth.uid()))
);
CREATE POLICY "join_requests_update_team_owner_or_sender" ON public.join_requests FOR UPDATE USING (
  auth.uid() = sender_id
  OR EXISTS (SELECT 1 FROM public.teams t WHERE t.id = team_id AND t.user_id = auth.uid())
) WITH CHECK (
  auth.uid() = sender_id
  OR EXISTS (SELECT 1 FROM public.teams t WHERE t.id = team_id AND t.user_id = auth.uid())
);
CREATE POLICY "join_requests_delete" ON public.join_requests FOR DELETE USING (
  auth.uid() = sender_id
  OR EXISTS (SELECT 1 FROM public.teams t WHERE t.id = team_id AND t.user_id = auth.uid())
);
