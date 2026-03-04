
-- Create a function that calls the send-push edge function via pg_net
-- when a new notification is inserted
CREATE OR REPLACE FUNCTION public.trigger_send_push()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _supabase_url text;
  _service_key text;
BEGIN
  -- Get config from vault or env
  SELECT decrypted_secret INTO _supabase_url
  FROM vault.decrypted_secrets
  WHERE name = 'SUPABASE_URL'
  LIMIT 1;

  SELECT decrypted_secret INTO _service_key
  FROM vault.decrypted_secrets
  WHERE name = 'SUPABASE_SERVICE_ROLE_KEY'
  LIMIT 1;

  -- Call send-push edge function asynchronously via pg_net
  PERFORM net.http_post(
    url := _supabase_url || '/functions/v1/send-push',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || _service_key
    ),
    body := jsonb_build_object(
      'notification_id', NEW.id,
      'user_id', NEW.user_id,
      'title', NEW.title,
      'body', NEW.body,
      'type', NEW.type,
      'metadata', NEW.metadata
    )
  );

  RETURN NEW;
END;
$$;

-- Attach trigger to notifications table
CREATE TRIGGER on_notification_send_push
  AFTER INSERT ON public.notifications
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_send_push();
