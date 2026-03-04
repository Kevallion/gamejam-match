-- Direct contact requests between jammers (1:1 networking, outside of teams)
-- This table stores simple connection requests between two profiles.

CREATE TABLE IF NOT EXISTS public.contact_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  receiver_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  -- Optional snapshot of the sender's email at the time of the request,
  -- so the receiver can contact them directly if the request is accepted.
  sender_email text,
  message text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE public.contact_requests ENABLE ROW LEVEL SECURITY;

-- Idempotent policy definitions
DROP POLICY IF EXISTS "contact_requests_select_sender_or_receiver" ON public.contact_requests;
DROP POLICY IF EXISTS "contact_requests_insert_sender" ON public.contact_requests;
DROP POLICY IF EXISTS "contact_requests_update_receiver" ON public.contact_requests;

-- Read: a user can see requests where they are either sender or receiver
CREATE POLICY "contact_requests_select_sender_or_receiver"
  ON public.contact_requests
  FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Insert: only the authenticated user can create a request as the sender
CREATE POLICY "contact_requests_insert_sender"
  ON public.contact_requests
  FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

-- Update (accept / decline): only the receiver of the request can change it
CREATE POLICY "contact_requests_update_receiver"
  ON public.contact_requests
  FOR UPDATE
  USING (auth.uid() = receiver_id)
  WITH CHECK (auth.uid() = receiver_id);

-- Helpful indexes for dashboard queries
CREATE INDEX IF NOT EXISTS idx_contact_requests_receiver_created_at
  ON public.contact_requests (receiver_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_contact_requests_sender_created_at
  ON public.contact_requests (sender_id, created_at DESC);

