
-- View that masks vote_count when voting is still open for the week
CREATE OR REPLACE VIEW public.submissions_public AS
SELECT
  s.id, s.user_id, s.week_id, s.category_id, s.status, s.rights_declaration,
  CASE
    WHEN w.voting_close_at > now() THEN 0
    ELSE s.vote_count
  END AS vote_count,
  s.created_at, s.updated_at, s.title, s.artist_name, s.description, s.tags,
  s.audio_excerpt_url, s.cover_image_url, s.external_url, s.rejection_reason
FROM public.submissions s
JOIN public.weeks w ON s.week_id = w.id;
