-- Signed-out /find-members cards lost their description after S7: the card
-- shows the author's profile bio ("About Me", set in the availability form),
-- and get_public_availability_posts() did not return it (the client mapped
-- bio to ""). Signed-in users read it from profiles.bio. Regression reported by
-- Wisllor (21 Nov 2026): the bio is shown on public availability cards again.
--
-- Same function, same filters, order, pagination and privileges, plus one
-- column: bio (profiles.bio, trimmed, NULL when empty). Still never portfolio,
-- discord_username, xp/title, kudos, jam, email_* or the post copies.
-- profiles / availability_posts stay closed to anon. The return type changes,
-- so the function is dropped and recreated (in the migration transaction).
-- No data change. Idempotent.

DROP FUNCTION IF EXISTS public.get_public_availability_posts(text, text, text, text[], text, text, uuid, integer, integer);
CREATE FUNCTION public.get_public_availability_posts(
  p_search text DEFAULT NULL,
  p_role text DEFAULT NULL,
  p_engine text DEFAULT NULL,
  p_experience text[] DEFAULT NULL,
  p_language text DEFAULT NULL,
  p_programming_language text DEFAULT NULL,
  p_jam_id uuid DEFAULT NULL,
  p_offset integer DEFAULT 0,
  p_limit integer DEFAULT 25
)
RETURNS TABLE (
  post_id uuid,
  user_id uuid,
  availability text,
  created_at timestamptz,
  updated_at timestamptz,
  expires_at timestamptz,
  username text,
  avatar_url text,
  role text,
  experience text,
  jam_style text,
  engine text,
  language text,
  programming_languages text[],
  bio text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT
    ap.id,
    ap.user_id,
    ap.availability::text,
    ap.created_at,
    ap.updated_at,
    ap.expires_at,
    p.username::text,
    p.avatar_url::text,
    COALESCE(NULLIF(btrim(p.role::text), ''), NULLIF(btrim(p.default_role::text), ''), NULLIF(btrim(p.main_role::text), '')),
    COALESCE(NULLIF(btrim(p.experience::text), ''), NULLIF(btrim(p.experience_level::text), '')),
    NULLIF(btrim(p.jam_style::text), ''),
    COALESCE(NULLIF(btrim(p.engine::text), ''), NULLIF(btrim(p.default_engine::text), '')),
    COALESCE(NULLIF(btrim(p.language::text), ''), NULLIF(btrim(p.default_language::text), '')),
    COALESCE(p.programming_languages, ARRAY[]::text[]),
    NULLIF(btrim(p.bio::text), '')
  FROM public.availability_posts ap
  JOIN public.profiles p ON p.id = ap.user_id
  WHERE ap.expires_at > pg_catalog.now()
    AND ap.availability IS NOT NULL
    AND ap.availability <> ''
    AND (NULLIF(btrim(p_search), '') IS NULL
         OR pg_catalog.strpos(pg_catalog.lower(p.username), pg_catalog.lower(btrim(p_search))) > 0)
    AND (p_jam_id IS NULL OR p.jam_id = p_jam_id)
    AND (NULLIF(btrim(p_role), '') IS NULL
         OR btrim(p_role) IN (p.role, p.default_role, p.main_role))
    AND (NULLIF(btrim(p_engine), '') IS NULL
         OR btrim(p_engine) IN (p.engine, p.default_engine))
    AND (p_experience IS NULL OR pg_catalog.cardinality(p_experience) = 0
         OR p.experience = ANY (p_experience) OR p.experience_level = ANY (p_experience))
    AND (NULLIF(btrim(p_language), '') IS NULL
         OR btrim(p_language) IN (p.language, p.default_language))
    AND (NULLIF(btrim(p_programming_language), '') IS NULL
         OR p.programming_languages @> ARRAY[btrim(p_programming_language)])
  ORDER BY ap.updated_at DESC NULLS LAST, ap.id
  OFFSET GREATEST(COALESCE(p_offset, 0), 0)
  LIMIT LEAST(GREATEST(COALESCE(p_limit, 25), 1), 101);
$$;
REVOKE ALL ON FUNCTION public.get_public_availability_posts(text, text, text, text[], text, text, uuid, integer, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_public_availability_posts(text, text, text, text[], text, text, uuid, integer, integer) TO anon, authenticated, service_role;
