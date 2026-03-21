-- Atomic account deletion function to ensure transactional consistency.
-- Deletes all user data in a single transaction, respecting foreign key order.
CREATE OR REPLACE FUNCTION public.delete_user_data(_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- 1. Delete vote events (depends on votes)
  DELETE FROM public.vote_events
  WHERE vote_id IN (SELECT id FROM public.votes WHERE user_id = _user_id);

  -- 2. Delete votes
  DELETE FROM public.votes WHERE user_id = _user_id;

  -- 3. Delete submissions
  DELETE FROM public.submissions WHERE user_id = _user_id;

  -- 4. Delete social data
  DELETE FROM public.follows WHERE follower_id = _user_id OR following_id = _user_id;
  DELETE FROM public.activities WHERE user_id = _user_id;
  DELETE FROM public.notifications WHERE user_id = _user_id;
  DELETE FROM public.push_subscriptions WHERE user_id = _user_id;

  -- 5. Delete gamification data
  DELETE FROM public.weekly_badges WHERE user_id = _user_id;
  DELETE FROM public.vote_streaks WHERE user_id = _user_id;

  -- 6. Delete analytics
  DELETE FROM public.analytics_events WHERE user_id = _user_id;

  -- 7. Delete profile & role
  DELETE FROM public.user_roles WHERE user_id = _user_id;
  DELETE FROM public.profiles WHERE id = _user_id;

  -- Note: auth.users deletion is handled by the Edge Function via admin API
  -- because it requires the service role auth admin endpoint.
END;
$$;
