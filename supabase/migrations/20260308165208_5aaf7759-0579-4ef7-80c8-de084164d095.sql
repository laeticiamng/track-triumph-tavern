ALTER TABLE public.webhook_events
  ADD COLUMN IF NOT EXISTS retry_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS next_retry_at timestamp with time zone DEFAULT NULL;

CREATE INDEX IF NOT EXISTS idx_webhook_events_retry
  ON public.webhook_events (status, next_retry_at)
  WHERE status = 'failed' AND retry_count < 5;