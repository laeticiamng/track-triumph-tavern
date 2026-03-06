-- P0: Add preview audio columns to submissions
ALTER TABLE public.submissions
  ADD COLUMN IF NOT EXISTS preview_start_sec integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS preview_end_sec integer DEFAULT 30;

-- P1: Restrict vote_streaks - drop overly permissive policy
DROP POLICY IF EXISTS "Authenticated users can view all streaks for leaderboard" ON public.vote_streaks;

-- P1: Restrict activities to owner + followed users
DROP POLICY IF EXISTS "Users can view all activities for feed" ON public.activities;
CREATE POLICY "Users can view own and followed activities"
  ON public.activities FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR user_id IN (
      SELECT following_id FROM public.follows WHERE follower_id = auth.uid()
    )
  );