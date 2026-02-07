
-- Add metadata jsonb column to vote_events for fraud signals
ALTER TABLE public.vote_events ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}'::jsonb;
