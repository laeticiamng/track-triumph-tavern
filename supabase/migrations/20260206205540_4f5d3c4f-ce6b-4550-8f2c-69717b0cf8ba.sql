
-- Function to atomically increment vote_count
CREATE OR REPLACE FUNCTION public.increment_vote_count(_submission_id uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.submissions 
  SET vote_count = vote_count + 1 
  WHERE id = _submission_id;
$$;
