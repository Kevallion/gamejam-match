-- ONB-4: jam windows are optional. Squads without dates store NULL
-- (timestamptz cannot hold the text sentinel "Not specified").
-- Display already maps missing dates to "Flexible dates".
-- Staging only in this ticket; do not apply on production without Wisllor's approval.

ALTER TABLE public.teams
  ALTER COLUMN jam_start_date DROP NOT NULL,
  ALTER COLUMN jam_end_date DROP NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'teams_jam_dates_both_or_ordered'
      AND conrelid = 'public.teams'::regclass
  ) THEN
    ALTER TABLE public.teams
      ADD CONSTRAINT teams_jam_dates_both_or_ordered
      CHECK (
        (jam_start_date IS NULL AND jam_end_date IS NULL)
        OR (
          jam_start_date IS NOT NULL
          AND jam_end_date IS NOT NULL
          AND jam_start_date <= jam_end_date
        )
      );
  END IF;
END
$$;
