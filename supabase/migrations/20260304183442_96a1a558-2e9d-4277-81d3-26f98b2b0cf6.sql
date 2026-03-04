
-- Enable RLS on the submissions_public view
-- Views with security_invoker=on inherit RLS from the underlying tables (submissions, weeks)
-- but we still need RLS enabled on the view itself
ALTER VIEW public.submissions_public SET (security_barrier = on);
