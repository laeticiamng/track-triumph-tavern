CREATE TABLE public.webhook_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_event_id text UNIQUE NOT NULL,
  event_type text NOT NULL,
  payload jsonb DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'pending',
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now(),
  processed_at timestamptz
);

CREATE INDEX idx_webhook_events_stripe_id ON public.webhook_events (stripe_event_id);
CREATE INDEX idx_webhook_events_status ON public.webhook_events (status);

ALTER TABLE public.webhook_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view webhook events"
  ON public.webhook_events FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Service role can insert webhook events"
  ON public.webhook_events FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Service role can update webhook events"
  ON public.webhook_events FOR UPDATE
  USING (true);