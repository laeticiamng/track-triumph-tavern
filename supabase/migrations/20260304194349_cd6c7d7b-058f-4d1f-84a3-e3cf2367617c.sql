
-- Notifications table
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  type text NOT NULL,
  title text NOT NULL,
  body text,
  metadata jsonb DEFAULT '{}'::jsonb,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Index for fast lookup
CREATE INDEX idx_notifications_user_created ON public.notifications (user_id, created_at DESC);
CREATE INDEX idx_notifications_user_unread ON public.notifications (user_id) WHERE read_at IS NULL;

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Trigger: notify submission owner when a vote is received
CREATE OR REPLACE FUNCTION public.notify_vote_received()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
AS $$
DECLARE
  _submission record;
BEGIN
  -- Get submission details
  SELECT id, title, artist_name, user_id
  INTO _submission
  FROM public.submissions
  WHERE id = NEW.submission_id;

  -- Don't notify if user voted on their own submission
  IF _submission.user_id = NEW.user_id THEN
    RETURN NEW;
  END IF;

  INSERT INTO public.notifications (user_id, type, title, body, metadata)
  VALUES (
    _submission.user_id,
    'vote_received',
    'Nouveau vote reçu',
    format('Votre morceau "%s" a reçu un nouveau vote !', _submission.title),
    jsonb_build_object('submission_id', _submission.id, 'vote_id', NEW.id)
  );

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_notify_vote_received
  AFTER INSERT ON public.votes
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_vote_received();

-- Trigger: notify all users when a new week opens (is_active becomes true)
CREATE OR REPLACE FUNCTION public.notify_new_week()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.is_active = true AND (OLD.is_active = false OR OLD.is_active IS NULL) THEN
    INSERT INTO public.notifications (user_id, type, title, body, metadata)
    SELECT
      p.id,
      'new_week',
      'Nouveau concours !',
      format('La semaine %s est ouverte. Soumettez et votez !', NEW.week_number),
      jsonb_build_object('week_id', NEW.id, 'week_number', NEW.week_number)
    FROM public.profiles p;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_notify_new_week
  AFTER UPDATE ON public.weeks
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_new_week();

-- Trigger: notify all users when results are published
CREATE OR REPLACE FUNCTION public.notify_results_published()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.results_published_at IS NOT NULL AND OLD.results_published_at IS NULL THEN
    INSERT INTO public.notifications (user_id, type, title, body, metadata)
    SELECT
      p.id,
      'results_published',
      'Résultats disponibles !',
      format('Les résultats de la semaine %s sont publiés. Découvrez le podium !', NEW.week_number),
      jsonb_build_object('week_id', NEW.id, 'week_number', NEW.week_number)
    FROM public.profiles p;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_notify_results_published
  AFTER UPDATE ON public.weeks
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_results_published();
