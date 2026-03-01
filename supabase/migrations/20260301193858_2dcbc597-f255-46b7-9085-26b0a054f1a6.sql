
-- Weekly badges table
CREATE TABLE public.weekly_badges (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  week_id uuid NOT NULL REFERENCES public.weeks(id),
  badge_type text NOT NULL CHECK (badge_type IN ('top_voter', 'discoverer', 'critic', 'eclectic')),
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, week_id, badge_type)
);

-- Index for fast lookups
CREATE INDEX idx_weekly_badges_user_id ON public.weekly_badges(user_id);
CREATE INDEX idx_weekly_badges_week_id ON public.weekly_badges(week_id);

-- RLS
ALTER TABLE public.weekly_badges ENABLE ROW LEVEL SECURITY;

-- Everyone can view badges (for leaderboard/profile)
CREATE POLICY "Badges are viewable by everyone"
  ON public.weekly_badges FOR SELECT
  USING (true);

-- Only backend can insert (via service role / edge function)
CREATE POLICY "Service role can manage badges"
  ON public.weekly_badges FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));
