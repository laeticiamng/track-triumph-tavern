-- Atomic rate-limited vote insertion to prevent race conditions.
-- Returns the new vote ID on success, or raises an exception on limit violation.
CREATE OR REPLACE FUNCTION public.cast_vote_atomic(
  _user_id uuid,
  _submission_id uuid,
  _category_id uuid,
  _week_id uuid,
  _originality_score smallint DEFAULT NULL,
  _production_score smallint DEFAULT NULL,
  _emotion_score smallint DEFAULT NULL,
  _comment text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _hourly_count int;
  _burst_count int;
  _vote_id uuid;
BEGIN
  -- Lock on user to serialize concurrent votes from the same user
  PERFORM pg_advisory_xact_lock(hashtext(_user_id::text));

  -- Hourly rate limit: max 50 votes/hour
  SELECT count(*) INTO _hourly_count
  FROM public.votes
  WHERE user_id = _user_id
    AND created_at >= now() - interval '1 hour';

  IF _hourly_count >= 50 THEN
    RAISE EXCEPTION 'RATE_LIMIT_HOURLY';
  END IF;

  -- Burst rate limit: max 5 votes/minute
  SELECT count(*) INTO _burst_count
  FROM public.votes
  WHERE user_id = _user_id
    AND created_at >= now() - interval '1 minute';

  IF _burst_count >= 5 THEN
    RAISE EXCEPTION 'RATE_LIMIT_BURST';
  END IF;

  -- Insert vote
  INSERT INTO public.votes (
    user_id, submission_id, category_id, week_id,
    originality_score, production_score, emotion_score,
    comment, is_valid
  ) VALUES (
    _user_id, _submission_id, _category_id, _week_id,
    _originality_score, _production_score, _emotion_score,
    _comment, true
  )
  RETURNING id INTO _vote_id;

  -- Atomically increment vote count
  UPDATE public.submissions
  SET vote_count = vote_count + 1
  WHERE id = _submission_id;

  RETURN _vote_id;
END;
$$;
