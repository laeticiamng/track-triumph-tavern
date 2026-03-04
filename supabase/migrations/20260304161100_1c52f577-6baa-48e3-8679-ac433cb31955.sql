-- 1. Restrict profiles: viewable by authenticated users only (not anonymous)
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Profiles are viewable by authenticated users"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

-- 2. Restrict vote_streaks: leaderboard only for authenticated users
DROP POLICY IF EXISTS "Users can view all streaks for leaderboard" ON public.vote_streaks;
CREATE POLICY "Authenticated users can view all streaks for leaderboard"
  ON public.vote_streaks FOR SELECT
  TO authenticated
  USING (true);
