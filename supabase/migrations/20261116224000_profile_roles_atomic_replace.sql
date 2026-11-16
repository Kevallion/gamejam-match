-- T5: replace a jammer's roles atomically.
--
-- Before: saveProfileSettings ran `DELETE FROM profile_roles` then `INSERT` as two separate
-- requests. Two tabs saving at the same time could interleave and leave the jammer with no
-- roles, or fail on profile_roles_user_role_unique / the max-two trigger.
--
-- Now: one function call = one transaction. A per-user transaction-scoped advisory lock
-- serializes concurrent saves of the same jammer, so the second save waits for the first to
-- commit and then replaces its roles cleanly (last write wins, never an empty or mixed set).
--
-- SECURITY INVOKER: runs as the calling user, so the existing RLS policies on profile_roles
-- (insert/delete own rows only) still apply. The user id always comes from auth.uid().

CREATE OR REPLACE FUNCTION public.replace_own_profile_roles(p_roles jsonb)
RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_user_id uuid := auth.uid();
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'You must be signed in.' USING ERRCODE = '28000';
  END IF;

  IF p_roles IS NULL OR jsonb_typeof(p_roles) <> 'array' THEN
    RAISE EXCEPTION 'p_roles must be a JSON array.' USING ERRCODE = '22023';
  END IF;

  IF jsonb_array_length(p_roles) > 2 THEN
    RAISE EXCEPTION 'A jammer can only have up to 2 roles.' USING ERRCODE = '22023';
  END IF;

  -- Serialize concurrent saves for this jammer until the end of the transaction.
  PERFORM pg_advisory_xact_lock(hashtextextended('profile_roles:' || v_user_id::text, 0));

  DELETE FROM public.profile_roles
  WHERE user_id = v_user_id;

  INSERT INTO public.profile_roles (user_id, role, experience_level, is_primary)
  SELECT
    v_user_id,
    r.role,
    r.experience_level,
    COALESCE(r.is_primary, false)
  FROM jsonb_to_recordset(p_roles) AS r(role text, experience_level text, is_primary boolean);
END;
$$;

REVOKE ALL ON FUNCTION public.replace_own_profile_roles(jsonb) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.replace_own_profile_roles(jsonb) FROM anon;
GRANT EXECUTE ON FUNCTION public.replace_own_profile_roles(jsonb) TO authenticated;

COMMENT ON FUNCTION public.replace_own_profile_roles(jsonb) IS
  'Atomically replaces the calling jammer''s profile_roles (max 2). Concurrent calls for the same user are serialized.';
