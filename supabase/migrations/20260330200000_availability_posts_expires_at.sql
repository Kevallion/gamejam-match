-- Align availability announcements with team listings: 30-day visibility + cleanup-ready.
ALTER TABLE public.availability_posts
  ADD COLUMN IF NOT EXISTS expires_at timestamptz
  DEFAULT (now() + interval '30 days');

UPDATE public.availability_posts
SET expires_at = COALESCE(created_at, now()) + interval '30 days'
WHERE expires_at IS NULL;

ALTER TABLE public.availability_posts
  ALTER COLUMN expires_at SET DEFAULT (now() + interval '30 days');

ALTER TABLE public.availability_posts
  ALTER COLUMN expires_at SET NOT NULL;
