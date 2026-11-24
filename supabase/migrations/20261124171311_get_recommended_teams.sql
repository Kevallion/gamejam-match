-- DS-3h: recommend at most a small set of recruiting teams whose looking_for
-- matches the caller's roles, instead of fetching 80 rows for 3 cards.
-- SECURITY INVOKER: RLS on public.teams applies; auth.uid() is the caller.

CREATE OR REPLACE FUNCTION public.get_recommended_teams(
  p_role_keys text[],
  p_exclude_ids uuid[] DEFAULT '{}'::uuid[],
  p_limit integer DEFAULT 12
)
RETURNS TABLE (
  id uuid,
  user_id uuid,
  team_name text,
  engine text,
  looking_for jsonb,
  created_at timestamptz,
  expires_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = ''
AS $$
  SELECT
    t.id,
    t.user_id,
    t.team_name,
    t.engine,
    to_jsonb(t.looking_for),
    t.created_at,
    t.expires_at
  FROM public.teams AS t
  WHERE t.expires_at > now()
    AND auth.uid() IS NOT NULL
    AND t.user_id IS DISTINCT FROM auth.uid()
    AND (
      p_exclude_ids IS NULL
      OR cardinality(p_exclude_ids) = 0
      OR t.id <> ALL (p_exclude_ids)
    )
    AND p_role_keys IS NOT NULL
    AND cardinality(p_role_keys) > 0
    AND EXISTS (
      SELECT 1
      FROM jsonb_array_elements(
        CASE
          WHEN jsonb_typeof(to_jsonb(t.looking_for)) = 'array' THEN to_jsonb(t.looking_for)
          ELSE '[]'::jsonb
        END
      ) AS entry
      WHERE lower(btrim(coalesce(entry->>'role', ''))) = ANY (p_role_keys)
    )
  ORDER BY t.created_at DESC
  LIMIT least(greatest(coalesce(p_limit, 12), 1), 24);
$$;

REVOKE ALL ON FUNCTION public.get_recommended_teams(text[], uuid[], integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_recommended_teams(text[], uuid[], integer) TO authenticated;