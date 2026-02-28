
-- Table to track voting streaks per user
CREATE TABLE public.vote_streaks (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL UNIQUE,
  current_streak integer NOT NULL DEFAULT 0,
  longest_streak integer NOT NULL DEFAULT 0,
  last_vote_week_number integer,
  last_vote_week_id uuid REFERENCES public.weeks(id),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE public.vote_streaks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own streak"
  ON public.vote_streaks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view all streaks for leaderboard"
  ON public.vote_streaks FOR SELECT
  USING (true);

-- Function to update streak when a vote is cast
CREATE OR REPLACE FUNCTION public.update_vote_streak()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _week_number integer;
  _existing record;
BEGIN
  -- Get the week_number for this vote's week
  SELECT week_number INTO _week_number
  FROM public.weeks
  WHERE id = NEW.week_id;

  IF _week_number IS NULL THEN
    RETURN NEW;
  END IF;

  -- Get existing streak record
  SELECT * INTO _existing
  FROM public.vote_streaks
  WHERE user_id = NEW.user_id;

  IF _existing IS NULL THEN
    -- First time voter: create streak record
    INSERT INTO public.vote_streaks (user_id, current_streak, longest_streak, last_vote_week_number, last_vote_week_id, updated_at)
    VALUES (NEW.user_id, 1, 1, _week_number, NEW.week_id, now());
  ELSIF _existing.last_vote_week_number = _week_number THEN
    -- Already voted this week, no streak change
    NULL;
  ELSIF _existing.last_vote_week_number = _week_number - 1 THEN
    -- Consecutive week! Increment streak
    UPDATE public.vote_streaks
    SET current_streak = _existing.current_streak + 1,
        longest_streak = GREATEST(_existing.longest_streak, _existing.current_streak + 1),
        last_vote_week_number = _week_number,
        last_vote_week_id = NEW.week_id,
        updated_at = now()
    WHERE user_id = NEW.user_id;
  ELSE
    -- Streak broken, reset to 1
    UPDATE public.vote_streaks
    SET current_streak = 1,
        longest_streak = GREATEST(_existing.longest_streak, 1),
        last_vote_week_number = _week_number,
        last_vote_week_id = NEW.week_id,
        updated_at = now()
    WHERE user_id = NEW.user_id;
  END IF;

  RETURN NEW;
END;
$$;

-- Trigger on vote insert
CREATE TRIGGER trg_update_vote_streak
  AFTER INSERT ON public.votes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_vote_streak();
