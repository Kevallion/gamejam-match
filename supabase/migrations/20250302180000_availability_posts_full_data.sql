-- Each announcement is a full snapshot (username, role, etc.) - not just dates
ALTER TABLE public.availability_posts
  ADD COLUMN IF NOT EXISTS username text,
  ADD COLUMN IF NOT EXISTS role text,
  ADD COLUMN IF NOT EXISTS experience text,
  ADD COLUMN IF NOT EXISTS jam_style text,
  ADD COLUMN IF NOT EXISTS engine text,
  ADD COLUMN IF NOT EXISTS language text,
  ADD COLUMN IF NOT EXISTS bio text,
  ADD COLUMN IF NOT EXISTS portfolio_link text,
  ADD COLUMN IF NOT EXISTS avatar_url text;

CREATE POLICY "availability_posts_update_own"
  ON public.availability_posts FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Backfill from profiles for existing rows
UPDATE public.availability_posts ap
SET
  username = p.username,
  role = p.role,
  experience = COALESCE(p.experience, p.experience_level),
  jam_style = p.jam_style,
  engine = p.engine,
  language = p.language,
  bio = p.bio,
  portfolio_link = p.portfolio_link,
  avatar_url = p.avatar_url
FROM public.profiles p
WHERE ap.user_id = p.id AND ap.username IS NULL;
