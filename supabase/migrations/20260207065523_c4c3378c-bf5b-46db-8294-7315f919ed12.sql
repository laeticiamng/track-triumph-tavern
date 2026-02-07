
-- Add 'pending' and 'locked' to reward_pool_status enum
ALTER TYPE public.reward_pool_status ADD VALUE IF NOT EXISTS 'pending';
ALTER TYPE public.reward_pool_status ADD VALUE IF NOT EXISTS 'locked';

-- Create winners table
CREATE TABLE public.winners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  week_id uuid NOT NULL REFERENCES public.weeks(id) ON DELETE CASCADE,
  category_id uuid NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  submission_id uuid NOT NULL REFERENCES public.submissions(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  rank integer NOT NULL CHECK (rank BETWEEN 1 AND 3),
  vote_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (week_id, category_id, rank)
);

ALTER TABLE public.winners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Winners are viewable by everyone"
  ON public.winners FOR SELECT USING (true);

CREATE POLICY "Admins can manage winners"
  ON public.winners FOR ALL USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Create rewards table
CREATE TABLE public.rewards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  winner_id uuid NOT NULL REFERENCES public.winners(id) ON DELETE CASCADE,
  week_id uuid NOT NULL REFERENCES public.weeks(id) ON DELETE CASCADE,
  reward_type text NOT NULL CHECK (reward_type IN ('cash', 'fallback')),
  amount_cents bigint NOT NULL DEFAULT 0,
  label text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'claimed', 'paid')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.rewards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Winners can view their own rewards"
  ON public.rewards FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.winners w
      WHERE w.id = rewards.winner_id AND w.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all rewards"
  ON public.rewards FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage rewards"
  ON public.rewards FOR ALL
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Trigger for rewards updated_at
CREATE TRIGGER update_rewards_updated_at
  BEFORE UPDATE ON public.rewards
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
