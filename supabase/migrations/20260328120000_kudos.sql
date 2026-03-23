-- Kudos (endorsements) between profiles: one row per (sender, receiver, category).

CREATE TABLE public.kudos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  receiver_id uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  category text NOT NULL CHECK (
    category = ANY (ARRAY['Technical'::text, 'Artistic'::text, 'Leadership'::text, 'Friendly'::text])
  ),
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT kudos_sender_receiver_category_unique UNIQUE (sender_id, receiver_id, category)
);

CREATE INDEX kudos_receiver_id_idx ON public.kudos (receiver_id);
CREATE INDEX kudos_sender_id_idx ON public.kudos (sender_id);

ALTER TABLE public.kudos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "kudos_insert_own" ON public.kudos
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = sender_id
    AND sender_id IS DISTINCT FROM receiver_id
  );

-- Aggregated counts only (no exposure of who sent kudos).
CREATE OR REPLACE FUNCTION public.get_kudos_counts_for_users(p_user_ids uuid[])
RETURNS TABLE (receiver_id uuid, category text, cnt bigint)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT k.receiver_id, k.category, COUNT(*)::bigint AS cnt
  FROM public.kudos k
  WHERE k.receiver_id = ANY (p_user_ids)
  GROUP BY k.receiver_id, k.category;
$$;

REVOKE ALL ON FUNCTION public.get_kudos_counts_for_users(uuid[]) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_kudos_counts_for_users(uuid[]) TO anon;
GRANT EXECUTE ON FUNCTION public.get_kudos_counts_for_users(uuid[]) TO authenticated;
