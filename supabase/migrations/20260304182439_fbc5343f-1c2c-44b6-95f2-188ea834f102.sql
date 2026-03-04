
-- Function to nullify IP and User-Agent in vote_events older than 30 days
CREATE OR REPLACE FUNCTION public.purge_vote_events_pii()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.vote_events
  SET ip_address = NULL,
      user_agent = NULL
  WHERE created_at < now() - interval '30 days'
    AND (ip_address IS NOT NULL OR user_agent IS NOT NULL);
$$;
