
-- Follows table
CREATE TABLE public.follows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id uuid NOT NULL,
  following_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(follower_id, following_id),
  CONSTRAINT no_self_follow CHECK (follower_id != following_id)
);

ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view follows"
  ON public.follows FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can follow"
  ON public.follows FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can unfollow"
  ON public.follows FOR DELETE
  TO authenticated
  USING (auth.uid() = follower_id);

CREATE INDEX idx_follows_follower ON public.follows (follower_id);
CREATE INDEX idx_follows_following ON public.follows (following_id);

-- Activities table (feed events)
CREATE TABLE public.activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  type text NOT NULL,
  title text NOT NULL,
  body text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can read activities (feed is public among users)
CREATE POLICY "Authenticated users can view activities"
  ON public.activities FOR SELECT
  TO authenticated
  USING (true);

CREATE INDEX idx_activities_user_created ON public.activities (user_id, created_at DESC);
CREATE INDEX idx_activities_created ON public.activities (created_at DESC);

-- Enable realtime for activities
ALTER PUBLICATION supabase_realtime ADD TABLE public.activities;

-- Trigger: create activity when a submission is approved
CREATE OR REPLACE FUNCTION public.activity_on_submission_approved()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.status = 'approved' AND (OLD.status IS DISTINCT FROM 'approved') THEN
    INSERT INTO public.activities (user_id, type, title, body, metadata)
    VALUES (
      NEW.user_id,
      'new_submission',
      NEW.title,
      NEW.artist_name,
      jsonb_build_object(
        'submission_id', NEW.id,
        'cover_image_url', NEW.cover_image_url,
        'category_id', NEW.category_id
      )
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_activity_submission_approved
  AFTER UPDATE ON public.submissions
  FOR EACH ROW
  EXECUTE FUNCTION public.activity_on_submission_approved();

-- Trigger: create activity when user wins (placed on podium)
CREATE OR REPLACE FUNCTION public.activity_on_winner()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
AS $$
DECLARE
  _sub record;
BEGIN
  SELECT title, artist_name, cover_image_url
  INTO _sub
  FROM public.submissions
  WHERE id = NEW.submission_id;

  INSERT INTO public.activities (user_id, type, title, body, metadata)
  VALUES (
    NEW.user_id,
    'podium',
    COALESCE(_sub.title, 'Unknown'),
    COALESCE(_sub.artist_name, 'Unknown'),
    jsonb_build_object(
      'submission_id', NEW.submission_id,
      'rank', NEW.rank,
      'cover_image_url', COALESCE(_sub.cover_image_url, ''),
      'week_id', NEW.week_id
    )
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_activity_winner
  AFTER INSERT ON public.winners
  FOR EACH ROW
  EXECUTE FUNCTION public.activity_on_winner();

-- Trigger: create activity when user earns a badge
CREATE OR REPLACE FUNCTION public.activity_on_badge()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.activities (user_id, type, title, body, metadata)
  VALUES (
    NEW.user_id,
    'badge_earned',
    NEW.badge_type,
    NULL,
    jsonb_build_object('badge_type', NEW.badge_type, 'week_id', NEW.week_id)
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_activity_badge
  AFTER INSERT ON public.weekly_badges
  FOR EACH ROW
  EXECUTE FUNCTION public.activity_on_badge();
