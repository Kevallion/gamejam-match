-- Optional primary role for smart match / display (distinct from legacy `role` / `default_role`).
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS main_role text;
