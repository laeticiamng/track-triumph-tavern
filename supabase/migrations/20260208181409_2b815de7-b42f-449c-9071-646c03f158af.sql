-- Allow users to view their own vote events for transparency
CREATE POLICY "Users can view own vote events"
  ON public.vote_events FOR SELECT
  USING (auth.uid() = user_id);