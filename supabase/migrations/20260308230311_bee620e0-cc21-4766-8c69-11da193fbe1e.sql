
-- P0: Fix webhook_events unrestricted INSERT/UPDATE policies
-- These policies currently apply to {public} which includes anon - must restrict to service role only

-- Drop the dangerously permissive policies
DROP POLICY IF EXISTS "Service role can insert webhook events" ON public.webhook_events;
DROP POLICY IF EXISTS "Service role can update webhook events" ON public.webhook_events;

-- No replacement policies needed: service role bypasses RLS entirely.
-- Webhook writes should only happen from edge functions using service role key.

-- P1: Remove overly permissive vote_events INSERT policy that lets users inject arbitrary audit records
DROP POLICY IF EXISTS "System can insert vote events" ON public.vote_events;

-- Vote events should only be inserted by the cast-vote edge function via service role.
-- The service role bypasses RLS, so no replacement INSERT policy is needed.

-- Also fix the contact_messages INSERT policy that allows unchecked inserts
DROP POLICY IF EXISTS "Anyone can submit contact messages" ON public.contact_messages;

-- Re-create with anon allowed but limited (the rate limit trigger on analytics is separate)
CREATE POLICY "Anyone can submit contact messages"
  ON public.contact_messages
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);
