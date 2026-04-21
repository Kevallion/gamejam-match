-- Prevent duplicate Launch Jam announcement sends across reruns.
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS launch_jam_announcement_sent_at TIMESTAMPTZ;
