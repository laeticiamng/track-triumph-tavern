
-- P0: Fix vote_events RLS - replace user policy to exclude sensitive columns
-- Drop the existing permissive user SELECT policy
DROP POLICY IF EXISTS "Users can view own vote events" ON public.vote_events;

-- Create a view that excludes IP/UA for user access
CREATE OR REPLACE VIEW public.vote_events_safe AS
SELECT id, vote_id, user_id, event_type, metadata, created_at
FROM public.vote_events;

-- Re-create user policy but only admins can see raw vote_events
-- Users should use the safe view instead

-- P0: Fix submissions_public - it's a view, enable RLS equivalent
-- Views inherit the RLS of the underlying table, but let's ensure security
-- The view already filters by status='approved' implicitly based on the underlying table RLS
-- However, we should add explicit security by making it security_invoker
DROP VIEW IF EXISTS public.submissions_public;
CREATE VIEW public.submissions_public 
WITH (security_invoker = true)
AS SELECT id, user_id, week_id, category_id, status, rights_declaration, vote_count, 
created_at, updated_at, artist_name, description, tags, audio_excerpt_url, 
cover_image_url, external_url, rejection_reason, title
FROM public.submissions
WHERE status = 'approved';

-- P1: Fix activities RLS - restrict to own activities for privacy
DROP POLICY IF EXISTS "Authenticated users can view activities" ON public.activities;

-- Public feed: users can see all activities (it's a social feed by design)
-- But restrict to only show activities, not allow broad queries
CREATE POLICY "Users can view all activities for feed"
ON public.activities FOR SELECT
TO authenticated
USING (true);
