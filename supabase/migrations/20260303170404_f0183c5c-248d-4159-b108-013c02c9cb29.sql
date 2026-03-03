
-- Ticket 4: Indexes on analytics_events for performance
CREATE INDEX IF NOT EXISTS idx_analytics_events_event_created 
  ON public.analytics_events (event_name, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_analytics_events_created 
  ON public.analytics_events (created_at DESC);

-- Enable pg_cron and pg_net for Ticket 6
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;
