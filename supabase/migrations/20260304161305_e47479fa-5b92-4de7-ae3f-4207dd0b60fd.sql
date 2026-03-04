-- Rate-limit anonymous analytics inserts: max 20 events per user_id=NULL per minute
CREATE OR REPLACE FUNCTION public.check_analytics_rate_limit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  recent_count integer;
BEGIN
  -- Only rate-limit anonymous inserts
  IF NEW.user_id IS NULL THEN
    SELECT COUNT(*) INTO recent_count
    FROM public.analytics_events
    WHERE user_id IS NULL
      AND created_at > now() - interval '1 minute';

    IF recent_count >= 20 THEN
      RAISE EXCEPTION 'Rate limit exceeded for anonymous analytics events';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_analytics_rate_limit
  BEFORE INSERT ON public.analytics_events
  FOR EACH ROW
  EXECUTE FUNCTION public.check_analytics_rate_limit();
