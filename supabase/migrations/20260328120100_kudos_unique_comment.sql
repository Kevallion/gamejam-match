-- Document unique (sender_id, receiver_id, category): one endorsement per category per pair of jammers.
COMMENT ON CONSTRAINT kudos_sender_receiver_category_unique ON public.kudos IS
  'One kudos per sender per receiver per category (e.g. one Technical and one Friendly to the same teammate; never two Technical).';
