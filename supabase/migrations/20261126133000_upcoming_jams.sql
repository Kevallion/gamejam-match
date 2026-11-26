-- CAR-1: public catalog of upcoming/in-progress itch.io jams for the home carousel.
-- Idempotent. Applied on STAGING only in this ticket; do not apply on production.

CREATE TABLE IF NOT EXISTS public.upcoming_jams (
  itch_id bigint PRIMARY KEY,
  title text NOT NULL,
  url text NOT NULL,
  image_url text,
  host text,
  start_at timestamptz NOT NULL,
  end_at timestamptz NOT NULL,
  joined_count integer NOT NULL DEFAULT 0,
  fetched_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS upcoming_jams_end_at_idx
  ON public.upcoming_jams (end_at);

CREATE INDEX IF NOT EXISTS upcoming_jams_joined_count_desc_idx
  ON public.upcoming_jams (joined_count DESC);

ALTER TABLE public.upcoming_jams ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS upcoming_jams_select_public ON public.upcoming_jams;
CREATE POLICY upcoming_jams_select_public
  ON public.upcoming_jams
  FOR SELECT
  TO anon, authenticated
  USING (true);

GRANT SELECT ON TABLE public.upcoming_jams TO anon, authenticated;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON TABLE public.upcoming_jams FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.upcoming_jams TO service_role;
