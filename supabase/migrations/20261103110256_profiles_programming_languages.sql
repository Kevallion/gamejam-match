-- Programming languages a jammer uses on their profile.
-- Nullable so a deploy that reads the column before this migration can treat it as absent,
-- and so existing rows are not forced through a rewrite. Default is an empty array when
-- the column is omitted on insert. Row-level RLS policies on public.profiles are unchanged.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS programming_languages text[];

ALTER TABLE public.profiles
  ALTER COLUMN programming_languages SET DEFAULT '{}'::text[];

ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_programming_languages_values_check;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_programming_languages_values_check
  CHECK (
    programming_languages IS NULL
    OR (
      cardinality(programming_languages) <= 10
      AND programming_languages <@ ARRAY[
        'csharp',
        'cpp',
        'gdscript',
        'lua',
        'javascript',
        'python',
        'haxe',
        'rust',
        'java',
        'other'
      ]::text[]
    )
  );

CREATE INDEX IF NOT EXISTS idx_profiles_programming_languages
  ON public.profiles
  USING gin (programming_languages);
