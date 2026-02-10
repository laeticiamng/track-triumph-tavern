BEGIN;

-- Harmonise legacy slugs with launch taxonomy when target slugs are absent.
UPDATE public.categories
SET name = 'Hip-Hop', slug = 'hip-hop', icon = COALESCE(icon, 'mic-2')
WHERE slug = 'rap-trap'
  AND NOT EXISTS (SELECT 1 FROM public.categories WHERE slug = 'hip-hop');

UPDATE public.categories
SET name = 'Électro', slug = 'electro', icon = COALESCE(icon, 'zap')
WHERE slug = 'electronic'
  AND NOT EXISTS (SELECT 1 FROM public.categories WHERE slug = 'electro');

UPDATE public.categories
SET name = 'Rock', slug = 'rock', icon = COALESCE(icon, 'guitar')
WHERE slug = 'rock-indie'
  AND NOT EXISTS (SELECT 1 FROM public.categories WHERE slug = 'rock');

UPDATE public.categories
SET name = 'Autres', slug = 'autres', icon = COALESCE(icon, 'waves')
WHERE slug = 'open'
  AND NOT EXISTS (SELECT 1 FROM public.categories WHERE slug = 'autres');

-- Ensure the 9 launch categories are present and ordered.
INSERT INTO public.categories (name, slug, icon, sort_order)
VALUES
  ('Pop', 'pop', 'music', 1),
  ('Rock', 'rock', 'guitar', 2),
  ('Hip-Hop', 'hip-hop', 'mic-2', 3),
  ('Électro', 'electro', 'zap', 4),
  ('R&B', 'rnb', 'heart', 5),
  ('Jazz', 'jazz', 'music-2', 6),
  ('Classique', 'classique', 'book-open', 7),
  ('World', 'world', 'globe', 8),
  ('Autres', 'autres', 'waves', 9)
ON CONFLICT (slug)
DO UPDATE SET
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  sort_order = EXCLUDED.sort_order;

-- Clean up deprecated categories only when they are not referenced.
DELETE FROM public.categories c
WHERE c.slug NOT IN ('pop', 'rock', 'hip-hop', 'electro', 'rnb', 'jazz', 'classique', 'world', 'autres')
  AND NOT EXISTS (SELECT 1 FROM public.submissions s WHERE s.category_id = c.id)
  AND NOT EXISTS (SELECT 1 FROM public.votes v WHERE v.category_id = c.id)
  AND NOT EXISTS (SELECT 1 FROM public.winners w WHERE w.category_id = c.id);

COMMIT;
