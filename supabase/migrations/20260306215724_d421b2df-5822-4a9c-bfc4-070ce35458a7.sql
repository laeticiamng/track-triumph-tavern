
-- Fix security definer view warning by using security_invoker
DROP VIEW IF EXISTS public.vote_events_safe;
CREATE VIEW public.vote_events_safe 
WITH (security_invoker = true)
AS SELECT id, vote_id, user_id, event_type, metadata, created_at
FROM public.vote_events;
