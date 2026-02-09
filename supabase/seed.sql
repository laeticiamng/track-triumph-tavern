-- ============================================================================
-- Track Triumph — Beta Seed Data
-- Season 1, Week 1 — 24 demo submissions (2 per category) + votes + results
-- Run this via Supabase SQL Editor or CLI: supabase db execute --file supabase/seed.sql
-- ============================================================================

-- ── 1. Season 1 ──
INSERT INTO public.seasons (id, name, start_date, end_date, is_active)
VALUES (
  'a0000000-0000-0000-0000-000000000001',
  'Saison 1',
  '2026-02-09',
  '2026-05-31',
  true
)
ON CONFLICT (id) DO NOTHING;

-- ── 2. Week 1 (active, submissions closed, voting open) ──
INSERT INTO public.weeks (id, season_id, week_number, title, submission_open_at, submission_close_at, voting_open_at, voting_close_at, is_active)
VALUES (
  'b0000000-0000-0000-0000-000000000001',
  'a0000000-0000-0000-0000-000000000001',
  1,
  'Saison 1 — Semaine 1',
  '2026-02-09T00:00:00Z',
  '2026-02-12T23:59:59Z',
  '2026-02-09T00:00:00Z',
  '2026-02-15T23:59:59Z',
  true
)
ON CONFLICT (id) DO NOTHING;

-- ── 3. Reward Pool ──
INSERT INTO public.reward_pools (id, week_id, current_cents, minimum_cents, top1_amount_cents, top2_amount_cents, top3_amount_cents, status, fallback_label, sponsors)
VALUES (
  'c0000000-0000-0000-0000-000000000001',
  'b0000000-0000-0000-0000-000000000001',
  35000, -- 350€ total
  20000, -- 200€ minimum
  20000, -- 200€ 1st
  10000, -- 100€ 2nd
  5000,  -- 50€ 3rd
  'active',
  'Cadeaux et merch disponibles si budget non atteint',
  '[]'::jsonb
)
ON CONFLICT (id) DO NOTHING;

-- ── 4. Demo Profiles (10 users) ──
-- NOTE: These profiles reference auth.users IDs that must exist.
-- For demo purposes, we use fixed UUIDs. In production, create auth users first.
-- The profiles table references auth.users(id) via FK, so we insert into auth.users
-- only if your Supabase instance allows it. Otherwise, create users via the Auth API
-- and then run the submissions/votes seed.

-- We'll use a DO block to safely create demo data that references categories.
-- Categories should already exist from migrations.

-- ── 5. Fetch category IDs dynamically ──
DO $$
DECLARE
  cat_rap_trap uuid;
  cat_pop uuid;
  cat_afro uuid;
  cat_electronic uuid;
  cat_rnb uuid;
  cat_lofi uuid;
  cat_rock_indie uuid;
  cat_open uuid;
  cat_dj uuid;
  cat_reggae uuid;
  cat_country uuid;
  cat_jazz uuid;
  week_id uuid := 'b0000000-0000-0000-0000-000000000001';
  -- Demo user IDs (these need corresponding auth.users entries)
  u1 uuid := 'd0000000-0000-0000-0000-000000000001';
  u2 uuid := 'd0000000-0000-0000-0000-000000000002';
  u3 uuid := 'd0000000-0000-0000-0000-000000000003';
  u4 uuid := 'd0000000-0000-0000-0000-000000000004';
  u5 uuid := 'd0000000-0000-0000-0000-000000000005';
  u6 uuid := 'd0000000-0000-0000-0000-000000000006';
  u7 uuid := 'd0000000-0000-0000-0000-000000000007';
  u8 uuid := 'd0000000-0000-0000-0000-000000000008';
  u9 uuid := 'd0000000-0000-0000-0000-000000000009';
  u10 uuid := 'd0000000-0000-0000-0000-000000000010';
  -- Submission IDs
  s1 uuid; s2 uuid; s3 uuid; s4 uuid; s5 uuid; s6 uuid;
  s7 uuid; s8 uuid; s9 uuid; s10 uuid; s11 uuid; s12 uuid;
  s13 uuid; s14 uuid; s15 uuid; s16 uuid; s17 uuid; s18 uuid;
  s19 uuid; s20 uuid; s21 uuid; s22 uuid; s23 uuid; s24 uuid;
BEGIN
  -- Get category IDs
  SELECT id INTO cat_rap_trap FROM public.categories WHERE slug = 'rap-trap' LIMIT 1;
  SELECT id INTO cat_pop FROM public.categories WHERE slug = 'pop' LIMIT 1;
  SELECT id INTO cat_afro FROM public.categories WHERE slug = 'afro' LIMIT 1;
  SELECT id INTO cat_electronic FROM public.categories WHERE slug = 'electronic' LIMIT 1;
  SELECT id INTO cat_rnb FROM public.categories WHERE slug = 'rnb' LIMIT 1;
  SELECT id INTO cat_lofi FROM public.categories WHERE slug = 'lofi' LIMIT 1;
  SELECT id INTO cat_rock_indie FROM public.categories WHERE slug = 'rock-indie' LIMIT 1;
  SELECT id INTO cat_open FROM public.categories WHERE slug = 'open' LIMIT 1;
  SELECT id INTO cat_dj FROM public.categories WHERE slug = 'dj' LIMIT 1;
  SELECT id INTO cat_reggae FROM public.categories WHERE slug = 'reggae' LIMIT 1;
  SELECT id INTO cat_country FROM public.categories WHERE slug = 'country' LIMIT 1;
  SELECT id INTO cat_jazz FROM public.categories WHERE slug = 'jazz' LIMIT 1;

  -- Skip if categories don't exist yet
  IF cat_rap_trap IS NULL THEN
    RAISE NOTICE 'Categories not found. Run category migration first.';
    RETURN;
  END IF;

  -- ── Create demo auth users (Supabase service role required) ──
  -- These use a password hash for 'demo123456' (bcrypt)
  INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, created_at, updated_at, aud, role, raw_app_meta_data, raw_user_meta_data)
  VALUES
    (u1, '00000000-0000-0000-0000-000000000000', 'demo-artist-1@tracktriumphdemo.com', crypt('DemoPass123!', gen_salt('bf')), now(), now() - interval '7 days', now(), 'authenticated', 'authenticated', '{"provider":"email","providers":["email"]}'::jsonb, '{"display_name":"MC Lumiere"}'::jsonb),
    (u2, '00000000-0000-0000-0000-000000000000', 'demo-artist-2@tracktriumphdemo.com', crypt('DemoPass123!', gen_salt('bf')), now(), now() - interval '6 days', now(), 'authenticated', 'authenticated', '{"provider":"email","providers":["email"]}'::jsonb, '{"display_name":"Nova Beats"}'::jsonb),
    (u3, '00000000-0000-0000-0000-000000000000', 'demo-artist-3@tracktriumphdemo.com', crypt('DemoPass123!', gen_salt('bf')), now(), now() - interval '5 days', now(), 'authenticated', 'authenticated', '{"provider":"email","providers":["email"]}'::jsonb, '{"display_name":"Soleil Rouge"}'::jsonb),
    (u4, '00000000-0000-0000-0000-000000000000', 'demo-artist-4@tracktriumphdemo.com', crypt('DemoPass123!', gen_salt('bf')), now(), now() - interval '5 days', now(), 'authenticated', 'authenticated', '{"provider":"email","providers":["email"]}'::jsonb, '{"display_name":"ElectraWave"}'::jsonb),
    (u5, '00000000-0000-0000-0000-000000000000', 'demo-artist-5@tracktriumphdemo.com', crypt('DemoPass123!', gen_salt('bf')), now(), now() - interval '4 days', now(), 'authenticated', 'authenticated', '{"provider":"email","providers":["email"]}'::jsonb, '{"display_name":"Velvet Soul"}'::jsonb),
    (u6, '00000000-0000-0000-0000-000000000000', 'demo-artist-6@tracktriumphdemo.com', crypt('DemoPass123!', gen_salt('bf')), now(), now() - interval '4 days', now(), 'authenticated', 'authenticated', '{"provider":"email","providers":["email"]}'::jsonb, '{"display_name":"Lo-Fi Garden"}'::jsonb),
    (u7, '00000000-0000-0000-0000-000000000000', 'demo-artist-7@tracktriumphdemo.com', crypt('DemoPass123!', gen_salt('bf')), now(), now() - interval '3 days', now(), 'authenticated', 'authenticated', '{"provider":"email","providers":["email"]}'::jsonb, '{"display_name":"Rocka"}'::jsonb),
    (u8, '00000000-0000-0000-0000-000000000000', 'demo-artist-8@tracktriumphdemo.com', crypt('DemoPass123!', gen_salt('bf')), now(), now() - interval '3 days', now(), 'authenticated', 'authenticated', '{"provider":"email","providers":["email"]}'::jsonb, '{"display_name":"DJ Prism"}'::jsonb),
    (u9, '00000000-0000-0000-0000-000000000000', 'demo-artist-9@tracktriumphdemo.com', crypt('DemoPass123!', gen_salt('bf')), now(), now() - interval '2 days', now(), 'authenticated', 'authenticated', '{"provider":"email","providers":["email"]}'::jsonb, '{"display_name":"Irie Vibes"}'::jsonb),
    (u10, '00000000-0000-0000-0000-000000000000', 'demo-artist-10@tracktriumphdemo.com', crypt('DemoPass123!', gen_salt('bf')), now(), now() - interval '2 days', now(), 'authenticated', 'authenticated', '{"provider":"email","providers":["email"]}'::jsonb, '{"display_name":"Bluegrass Kid"}'::jsonb)
  ON CONFLICT (id) DO NOTHING;

  -- Create identities for auth
  INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, created_at, updated_at)
  VALUES
    (u1, u1, format('{"sub":"%s","email":"demo-artist-1@tracktriumphdemo.com"}', u1)::jsonb, 'email', u1::text, now(), now()),
    (u2, u2, format('{"sub":"%s","email":"demo-artist-2@tracktriumphdemo.com"}', u2)::jsonb, 'email', u2::text, now(), now()),
    (u3, u3, format('{"sub":"%s","email":"demo-artist-3@tracktriumphdemo.com"}', u3)::jsonb, 'email', u3::text, now(), now()),
    (u4, u4, format('{"sub":"%s","email":"demo-artist-4@tracktriumphdemo.com"}', u4)::jsonb, 'email', u4::text, now(), now()),
    (u5, u5, format('{"sub":"%s","email":"demo-artist-5@tracktriumphdemo.com"}', u5)::jsonb, 'email', u5::text, now(), now()),
    (u6, u6, format('{"sub":"%s","email":"demo-artist-6@tracktriumphdemo.com"}', u6)::jsonb, 'email', u6::text, now(), now()),
    (u7, u7, format('{"sub":"%s","email":"demo-artist-7@tracktriumphdemo.com"}', u7)::jsonb, 'email', u7::text, now(), now()),
    (u8, u8, format('{"sub":"%s","email":"demo-artist-8@tracktriumphdemo.com"}', u8)::jsonb, 'email', u8::text, now(), now()),
    (u9, u9, format('{"sub":"%s","email":"demo-artist-9@tracktriumphdemo.com"}', u9)::jsonb, 'email', u9::text, now(), now()),
    (u10, u10, format('{"sub":"%s","email":"demo-artist-10@tracktriumphdemo.com"}', u10)::jsonb, 'email', u10::text, now(), now())
  ON CONFLICT DO NOTHING;

  -- ── Demo profiles ──
  INSERT INTO public.profiles (id, display_name, avatar_url, bio)
  VALUES
    (u1, 'MC Lumiere', 'https://api.dicebear.com/9.x/adventurer/svg?seed=mc-lumiere', 'Rappeur lyonnais, amateur de flows techniques et de beats lourds.'),
    (u2, 'Nova Beats', 'https://api.dicebear.com/9.x/adventurer/svg?seed=nova-beats', 'Productrice pop/electro basee a Paris. Influences : Dua Lipa, Disclosure.'),
    (u3, 'Soleil Rouge', 'https://api.dicebear.com/9.x/adventurer/svg?seed=soleil-rouge', 'Afrobeats & Amapiano. La chaleur du continent dans chaque note.'),
    (u4, 'ElectraWave', 'https://api.dicebear.com/9.x/adventurer/svg?seed=electrawave', 'Producteur techno/house. Les basses qui font vibrer le dancefloor.'),
    (u5, 'Velvet Soul', 'https://api.dicebear.com/9.x/adventurer/svg?seed=velvet-soul', 'Chanteuse R&B aux influences neo-soul. Douceur et puissance.'),
    (u6, 'Lo-Fi Garden', 'https://api.dicebear.com/9.x/adventurer/svg?seed=lofi-garden', 'Ambiances lo-fi pour etudier, rever, se detendre. Beatmaker chill.'),
    (u7, 'Rocka', 'https://api.dicebear.com/9.x/adventurer/svg?seed=rocka', 'Guitariste rock indie. Melodies accrocheuses, riffs electriques.'),
    (u8, 'DJ Prism', 'https://api.dicebear.com/9.x/adventurer/svg?seed=dj-prism', 'DJ/producteur. Du deep house au drum & bass, set eclectique.'),
    (u9, 'Irie Vibes', 'https://api.dicebear.com/9.x/adventurer/svg?seed=irie-vibes', 'Reggae roots et dub moderne. Good vibes only.'),
    (u10, 'Bluegrass Kid', 'https://api.dicebear.com/9.x/adventurer/svg?seed=bluegrass-kid', 'Country & folk acoustique. Histoires de routes et de liberte.')
  ON CONFLICT (id) DO UPDATE SET display_name = EXCLUDED.display_name, avatar_url = EXCLUDED.avatar_url, bio = EXCLUDED.bio;

  -- ── 24 Demo Submissions (2 per category, all approved) ──
  -- Using placeholder audio/cover URLs (replace with actual Supabase Storage URLs in production)
  -- Audio: royalty-free placeholder (30s silence or generated preview)
  -- Cover: DiceBear generated covers

  -- Rap/Trap (2)
  INSERT INTO public.submissions (id, user_id, week_id, category_id, title, artist_name, description, tags, audio_excerpt_url, cover_image_url, status, rights_declaration, vote_count)
  VALUES
    (gen_random_uuid(), u1, week_id, cat_rap_trap, 'Nuit Blanche', 'MC Lumiere', 'Flow nocturne sur beat trap sombre. Les lumieres de la ville.', ARRAY['rap','trap','nocturne','francais'], 'https://cdn.pixabay.com/audio/2024/11/01/audio_6a35bfede5.mp3', 'https://api.dicebear.com/9.x/shapes/svg?seed=nuit-blanche&backgroundColor=1a1a2e', 'approved', true, 18)
  RETURNING id INTO s1;

  INSERT INTO public.submissions (id, user_id, week_id, category_id, title, artist_name, description, tags, audio_excerpt_url, cover_image_url, status, rights_declaration, vote_count)
  VALUES
    (gen_random_uuid(), u3, week_id, cat_rap_trap, 'Beton Brut', 'Soleil Rouge', 'Rap conscient sur instru boom-bap. La realite du quartier.', ARRAY['rap','boom-bap','conscient'], 'https://cdn.pixabay.com/audio/2024/03/11/audio_0e0f0ca5e5.mp3', 'https://api.dicebear.com/9.x/shapes/svg?seed=beton-brut&backgroundColor=2d2d44', 'approved', true, 12)
  RETURNING id INTO s2;

  -- Pop (2)
  INSERT INTO public.submissions (id, user_id, week_id, category_id, title, artist_name, description, tags, audio_excerpt_url, cover_image_url, status, rights_declaration, vote_count)
  VALUES
    (gen_random_uuid(), u2, week_id, cat_pop, 'Etoile Filante', 'Nova Beats', 'Pop electro dansante. Un refrain qui reste en tete.', ARRAY['pop','electro','dansant','catchy'], 'https://cdn.pixabay.com/audio/2024/09/11/audio_5b0a4a5c1a.mp3', 'https://api.dicebear.com/9.x/shapes/svg?seed=etoile-filante&backgroundColor=ff6b9d', 'approved', true, 22)
  RETURNING id INTO s3;

  INSERT INTO public.submissions (id, user_id, week_id, category_id, title, artist_name, description, tags, audio_excerpt_url, cover_image_url, status, rights_declaration, vote_count)
  VALUES
    (gen_random_uuid(), u5, week_id, cat_pop, 'Miroir', 'Velvet Soul', 'Ballade pop intimiste. Piano et voix.', ARRAY['pop','ballade','piano','intimiste'], 'https://cdn.pixabay.com/audio/2024/07/16/audio_45f4e87e88.mp3', 'https://api.dicebear.com/9.x/shapes/svg?seed=miroir-pop&backgroundColor=e8a4c8', 'approved', true, 15)
  RETURNING id INTO s4;

  -- Afro (2)
  INSERT INTO public.submissions (id, user_id, week_id, category_id, title, artist_name, description, tags, audio_excerpt_url, cover_image_url, status, rights_declaration, vote_count)
  VALUES
    (gen_random_uuid(), u3, week_id, cat_afro, 'Lagos Sunset', 'Soleil Rouge', 'Amapiano vibes. Le soleil se couche sur Lagos.', ARRAY['afrobeats','amapiano','lagos','sunset'], 'https://cdn.pixabay.com/audio/2024/08/13/audio_5f2e3c1b2a.mp3', 'https://api.dicebear.com/9.x/shapes/svg?seed=lagos-sunset&backgroundColor=ff9a3c', 'approved', true, 20)
  RETURNING id INTO s5;

  INSERT INTO public.submissions (id, user_id, week_id, category_id, title, artist_name, description, tags, audio_excerpt_url, cover_image_url, status, rights_declaration, vote_count)
  VALUES
    (gen_random_uuid(), u9, week_id, cat_afro, 'Danse Libre', 'Irie Vibes', 'Fusion afro-reggae. Percussions et guitare acoustique.', ARRAY['afro','fusion','percussions','danse'], 'https://cdn.pixabay.com/audio/2024/06/19/audio_2a7b3f8e12.mp3', 'https://api.dicebear.com/9.x/shapes/svg?seed=danse-libre&backgroundColor=d4a574', 'approved', true, 11)
  RETURNING id INTO s6;

  -- Electronic (2)
  INSERT INTO public.submissions (id, user_id, week_id, category_id, title, artist_name, description, tags, audio_excerpt_url, cover_image_url, status, rights_declaration, vote_count)
  VALUES
    (gen_random_uuid(), u4, week_id, cat_electronic, 'Synthwave Dreams', 'ElectraWave', 'Retro-futuriste. Synthes analogiques et arpeges.', ARRAY['electronic','synthwave','retro','arpeges'], 'https://cdn.pixabay.com/audio/2024/10/08/audio_4e6f8b1c9a.mp3', 'https://api.dicebear.com/9.x/shapes/svg?seed=synthwave-dreams&backgroundColor=0f0f2d', 'approved', true, 25)
  RETURNING id INTO s7;

  INSERT INTO public.submissions (id, user_id, week_id, category_id, title, artist_name, description, tags, audio_excerpt_url, cover_image_url, status, rights_declaration, vote_count)
  VALUES
    (gen_random_uuid(), u8, week_id, cat_electronic, 'Bass Reactor', 'DJ Prism', 'Drum & bass energique. Le dancefloor en fusion.', ARRAY['electronic','dnb','bass','energique'], 'https://cdn.pixabay.com/audio/2024/05/21/audio_3c5d7e9f11.mp3', 'https://api.dicebear.com/9.x/shapes/svg?seed=bass-reactor&backgroundColor=1a0a3e', 'approved', true, 16)
  RETURNING id INTO s8;

  -- R&B (2)
  INSERT INTO public.submissions (id, user_id, week_id, category_id, title, artist_name, description, tags, audio_excerpt_url, cover_image_url, status, rights_declaration, vote_count)
  VALUES
    (gen_random_uuid(), u5, week_id, cat_rnb, 'Velours', 'Velvet Soul', 'R&B neo-soul. Groove sensuel et voix chaude.', ARRAY['rnb','neo-soul','groove','sensuel'], 'https://cdn.pixabay.com/audio/2024/04/15/audio_1b2c3d4e5f.mp3', 'https://api.dicebear.com/9.x/shapes/svg?seed=velours-rnb&backgroundColor=4a1942', 'approved', true, 19)
  RETURNING id INTO s9;

  INSERT INTO public.submissions (id, user_id, week_id, category_id, title, artist_name, description, tags, audio_excerpt_url, cover_image_url, status, rights_declaration, vote_count)
  VALUES
    (gen_random_uuid(), u2, week_id, cat_rnb, 'Lueur', 'Nova Beats', 'R&B moderne aux influences UK garage.', ARRAY['rnb','modern','uk-garage','smooth'], 'https://cdn.pixabay.com/audio/2024/02/28/audio_8a9b0c1d2e.mp3', 'https://api.dicebear.com/9.x/shapes/svg?seed=lueur-rnb&backgroundColor=3d1f5c', 'approved', true, 13)
  RETURNING id INTO s10;

  -- Lo-Fi (2)
  INSERT INTO public.submissions (id, user_id, week_id, category_id, title, artist_name, description, tags, audio_excerpt_url, cover_image_url, status, rights_declaration, vote_count)
  VALUES
    (gen_random_uuid(), u6, week_id, cat_lofi, 'Pluie sur Tokyo', 'Lo-Fi Garden', 'Lo-fi hip-hop. Pluie, vinyle, nostalgie.', ARRAY['lofi','chill','tokyo','nostalgie'], 'https://cdn.pixabay.com/audio/2024/01/10/audio_7f8e9d0c1b.mp3', 'https://api.dicebear.com/9.x/shapes/svg?seed=pluie-tokyo&backgroundColor=2d4a3e', 'approved', true, 17)
  RETURNING id INTO s11;

  INSERT INTO public.submissions (id, user_id, week_id, category_id, title, artist_name, description, tags, audio_excerpt_url, cover_image_url, status, rights_declaration, vote_count)
  VALUES
    (gen_random_uuid(), u4, week_id, cat_lofi, 'Cafe Endormi', 'ElectraWave', 'Ambiance cafe parisien en fin d''apres-midi.', ARRAY['lofi','cafe','ambient','detente'], 'https://cdn.pixabay.com/audio/2024/03/25/audio_6e7d8c9b0a.mp3', 'https://api.dicebear.com/9.x/shapes/svg?seed=cafe-endormi&backgroundColor=3a5f4a', 'approved', true, 10)
  RETURNING id INTO s12;

  -- Rock/Indie (2)
  INSERT INTO public.submissions (id, user_id, week_id, category_id, title, artist_name, description, tags, audio_excerpt_url, cover_image_url, status, rights_declaration, vote_count)
  VALUES
    (gen_random_uuid(), u7, week_id, cat_rock_indie, 'Eclats de Verre', 'Rocka', 'Rock indie francais. Guitares saturees et melodie melancolique.', ARRAY['rock','indie','francais','guitare'], 'https://cdn.pixabay.com/audio/2024/07/03/audio_5d6e7f8a9b.mp3', 'https://api.dicebear.com/9.x/shapes/svg?seed=eclats-verre&backgroundColor=8b0000', 'approved', true, 14)
  RETURNING id INTO s13;

  INSERT INTO public.submissions (id, user_id, week_id, category_id, title, artist_name, description, tags, audio_excerpt_url, cover_image_url, status, rights_declaration, vote_count)
  VALUES
    (gen_random_uuid(), u1, week_id, cat_rock_indie, 'Autoroute', 'MC Lumiere', 'Rock alternatif. Sur la route, vitres baissees.', ARRAY['rock','alternatif','road','liberte'], 'https://cdn.pixabay.com/audio/2024/09/28/audio_4c5d6e7f8a.mp3', 'https://api.dicebear.com/9.x/shapes/svg?seed=autoroute-rock&backgroundColor=a52a2a', 'approved', true, 9)
  RETURNING id INTO s14;

  -- Open (2)
  INSERT INTO public.submissions (id, user_id, week_id, category_id, title, artist_name, description, tags, audio_excerpt_url, cover_image_url, status, rights_declaration, vote_count)
  VALUES
    (gen_random_uuid(), u6, week_id, cat_open, 'Horizons', 'Lo-Fi Garden', 'Ambient/experimental. Paysages sonores immersifs.', ARRAY['ambient','experimental','immersif','nature'], 'https://cdn.pixabay.com/audio/2024/12/05/audio_3b4c5d6e7f.mp3', 'https://api.dicebear.com/9.x/shapes/svg?seed=horizons-open&backgroundColor=1a3a4a', 'approved', true, 8)
  RETURNING id INTO s15;

  INSERT INTO public.submissions (id, user_id, week_id, category_id, title, artist_name, description, tags, audio_excerpt_url, cover_image_url, status, rights_declaration, vote_count)
  VALUES
    (gen_random_uuid(), u10, week_id, cat_open, 'Fragments', 'Bluegrass Kid', 'Fusion folk/electronique. Banjo et synthes.', ARRAY['fusion','folk','electronique','banjo'], 'https://cdn.pixabay.com/audio/2024/11/15/audio_2a3b4c5d6e.mp3', 'https://api.dicebear.com/9.x/shapes/svg?seed=fragments-open&backgroundColor=2a4a3a', 'approved', true, 7)
  RETURNING id INTO s16;

  -- DJ (2)
  INSERT INTO public.submissions (id, user_id, week_id, category_id, title, artist_name, description, tags, audio_excerpt_url, cover_image_url, status, rights_declaration, vote_count)
  VALUES
    (gen_random_uuid(), u8, week_id, cat_dj, 'Prism Set Vol.1', 'DJ Prism', 'Deep house mix. Transitions fluides et groove hypnotique.', ARRAY['dj','deep-house','mix','groove'], 'https://cdn.pixabay.com/audio/2024/08/30/audio_1f2e3d4c5b.mp3', 'https://api.dicebear.com/9.x/shapes/svg?seed=prism-set&backgroundColor=4a0a6e', 'approved', true, 21)
  RETURNING id INTO s17;

  INSERT INTO public.submissions (id, user_id, week_id, category_id, title, artist_name, description, tags, audio_excerpt_url, cover_image_url, status, rights_declaration, vote_count)
  VALUES
    (gen_random_uuid(), u4, week_id, cat_dj, 'Neon Nights', 'ElectraWave', 'Tech house set. L''energie des clubs berlinois.', ARRAY['dj','tech-house','berlin','club'], 'https://cdn.pixabay.com/audio/2024/06/12/audio_0e1f2d3c4b.mp3', 'https://api.dicebear.com/9.x/shapes/svg?seed=neon-nights-dj&backgroundColor=5a0a8e', 'approved', true, 14)
  RETURNING id INTO s18;

  -- Reggae (2)
  INSERT INTO public.submissions (id, user_id, week_id, category_id, title, artist_name, description, tags, audio_excerpt_url, cover_image_url, status, rights_declaration, vote_count)
  VALUES
    (gen_random_uuid(), u9, week_id, cat_reggae, 'Soleil Levant', 'Irie Vibes', 'Reggae roots positif. Le soleil se leve sur Kingston.', ARRAY['reggae','roots','positif','kingston'], 'https://cdn.pixabay.com/audio/2024/04/22/audio_9e0f1d2c3b.mp3', 'https://api.dicebear.com/9.x/shapes/svg?seed=soleil-levant&backgroundColor=006400', 'approved', true, 16)
  RETURNING id INTO s19;

  INSERT INTO public.submissions (id, user_id, week_id, category_id, title, artist_name, description, tags, audio_excerpt_url, cover_image_url, status, rights_declaration, vote_count)
  VALUES
    (gen_random_uuid(), u3, week_id, cat_reggae, 'Dub Station', 'Soleil Rouge', 'Dub electrique. Echo, delay, basses profondes.', ARRAY['reggae','dub','echo','basses'], 'https://cdn.pixabay.com/audio/2024/02/08/audio_8d9e0f1c2b.mp3', 'https://api.dicebear.com/9.x/shapes/svg?seed=dub-station&backgroundColor=004d00', 'approved', true, 11)
  RETURNING id INTO s20;

  -- Country (2)
  INSERT INTO public.submissions (id, user_id, week_id, category_id, title, artist_name, description, tags, audio_excerpt_url, cover_image_url, status, rights_declaration, vote_count)
  VALUES
    (gen_random_uuid(), u10, week_id, cat_country, 'Dusty Roads', 'Bluegrass Kid', 'Country folk acoustique. Guitare et harmonica.', ARRAY['country','folk','acoustique','harmonica'], 'https://cdn.pixabay.com/audio/2024/05/18/audio_7c8d9e0f1a.mp3', 'https://api.dicebear.com/9.x/shapes/svg?seed=dusty-roads&backgroundColor=c4a35a', 'approved', true, 13)
  RETURNING id INTO s21;

  INSERT INTO public.submissions (id, user_id, week_id, category_id, title, artist_name, description, tags, audio_excerpt_url, cover_image_url, status, rights_declaration, vote_count)
  VALUES
    (gen_random_uuid(), u7, week_id, cat_country, 'Barn Sessions', 'Rocka', 'Country rock. Slide guitar et batterie punchy.', ARRAY['country','rock','slide-guitar','live'], 'https://cdn.pixabay.com/audio/2024/10/25/audio_6b7c8d9e0f.mp3', 'https://api.dicebear.com/9.x/shapes/svg?seed=barn-sessions&backgroundColor=b8860b', 'approved', true, 8)
  RETURNING id INTO s22;

  -- Jazz (2)
  INSERT INTO public.submissions (id, user_id, week_id, category_id, title, artist_name, description, tags, audio_excerpt_url, cover_image_url, status, rights_declaration, vote_count)
  VALUES
    (gen_random_uuid(), u5, week_id, cat_jazz, 'Blue Midnight', 'Velvet Soul', 'Jazz vocal intimiste. Piano, contrebasse, voix.', ARRAY['jazz','vocal','intimiste','piano'], 'https://cdn.pixabay.com/audio/2024/03/15/audio_5a6b7c8d9e.mp3', 'https://api.dicebear.com/9.x/shapes/svg?seed=blue-midnight&backgroundColor=000033', 'approved', true, 15)
  RETURNING id INTO s23;

  INSERT INTO public.submissions (id, user_id, week_id, category_id, title, artist_name, description, tags, audio_excerpt_url, cover_image_url, status, rights_declaration, vote_count)
  VALUES
    (gen_random_uuid(), u8, week_id, cat_jazz, 'Swing Machine', 'DJ Prism', 'Nu-jazz electronique. Samples jazz et beats modernes.', ARRAY['jazz','nu-jazz','electronique','samples'], 'https://cdn.pixabay.com/audio/2024/01/28/audio_4f5a6b7c8d.mp3', 'https://api.dicebear.com/9.x/shapes/svg?seed=swing-machine&backgroundColor=000044', 'approved', true, 10)
  RETURNING id INTO s24;

  -- ── Generate votes (varied, realistic distribution) ──
  -- Each demo user votes in 3-8 categories, with scores 2-5
  -- Users cannot vote for their own submissions

  -- Helper: We'll create votes from each user for submissions they didn't create
  -- u1 votes for: s3(pop), s5(afro), s7(electronic), s9(rnb), s11(lofi), s17(dj)
  INSERT INTO public.votes (user_id, submission_id, category_id, week_id, emotion_score, originality_score, production_score, comment, is_valid) VALUES
    (u1, s3, cat_pop, week_id, 5, 4, 5, 'Refrain incroyable, ca reste en tete !', true),
    (u1, s5, cat_afro, week_id, 4, 5, 4, NULL, true),
    (u1, s7, cat_electronic, week_id, 5, 5, 5, 'Meilleur morceau de la semaine pour moi', true),
    (u1, s9, cat_rnb, week_id, 4, 4, 3, NULL, true),
    (u1, s11, cat_lofi, week_id, 3, 4, 4, NULL, true),
    (u1, s17, cat_dj, week_id, 5, 4, 5, 'Set de dingue !', true);

  -- u2 votes for: s1(rap), s5(afro), s7(electronic), s11(lofi), s13(rock), s19(reggae)
  INSERT INTO public.votes (user_id, submission_id, category_id, week_id, emotion_score, originality_score, production_score, comment, is_valid) VALUES
    (u2, s1, cat_rap_trap, week_id, 4, 4, 5, 'Flow impeccable', true),
    (u2, s5, cat_afro, week_id, 5, 4, 4, NULL, true),
    (u2, s7, cat_electronic, week_id, 4, 5, 5, NULL, true),
    (u2, s11, cat_lofi, week_id, 4, 3, 4, 'Ambiance parfaite', true),
    (u2, s13, cat_rock_indie, week_id, 3, 4, 4, NULL, true),
    (u2, s19, cat_reggae, week_id, 4, 3, 3, NULL, true);

  -- u3 votes for: s3(pop), s7(electronic), s9(rnb), s13(rock), s17(dj), s21(country)
  INSERT INTO public.votes (user_id, submission_id, category_id, week_id, emotion_score, originality_score, production_score, comment, is_valid) VALUES
    (u3, s3, cat_pop, week_id, 5, 5, 4, 'Production au top !', true),
    (u3, s7, cat_electronic, week_id, 5, 4, 5, NULL, true),
    (u3, s9, cat_rnb, week_id, 4, 5, 4, 'Voix incroyable', true),
    (u3, s13, cat_rock_indie, week_id, 4, 3, 4, NULL, true),
    (u3, s17, cat_dj, week_id, 5, 5, 4, NULL, true),
    (u3, s21, cat_country, week_id, 3, 4, 3, NULL, true);

  -- u4 votes for: s1(rap), s3(pop), s5(afro), s9(rnb), s19(reggae), s23(jazz)
  INSERT INTO public.votes (user_id, submission_id, category_id, week_id, emotion_score, originality_score, production_score, comment, is_valid) VALUES
    (u4, s1, cat_rap_trap, week_id, 3, 4, 4, NULL, true),
    (u4, s3, cat_pop, week_id, 4, 4, 5, NULL, true),
    (u4, s5, cat_afro, week_id, 5, 4, 5, 'Grosse vibe !', true),
    (u4, s9, cat_rnb, week_id, 5, 4, 4, NULL, true),
    (u4, s19, cat_reggae, week_id, 4, 3, 4, NULL, true),
    (u4, s23, cat_jazz, week_id, 4, 4, 4, NULL, true);

  -- u5 votes for: s1(rap), s5(afro), s7(electronic), s11(lofi), s17(dj), s19(reggae), s21(country)
  INSERT INTO public.votes (user_id, submission_id, category_id, week_id, emotion_score, originality_score, production_score, comment, is_valid) VALUES
    (u5, s1, cat_rap_trap, week_id, 4, 5, 4, 'Original et bien produit', true),
    (u5, s5, cat_afro, week_id, 4, 4, 4, NULL, true),
    (u5, s7, cat_electronic, week_id, 5, 5, 5, NULL, true),
    (u5, s11, cat_lofi, week_id, 5, 4, 5, 'Parfait pour bosser', true),
    (u5, s17, cat_dj, week_id, 4, 4, 5, NULL, true),
    (u5, s19, cat_reggae, week_id, 3, 4, 3, NULL, true),
    (u5, s21, cat_country, week_id, 4, 4, 3, NULL, true);

  -- u6 votes for: s1(rap), s3(pop), s7(electronic), s9(rnb), s13(rock), s23(jazz)
  INSERT INTO public.votes (user_id, submission_id, category_id, week_id, emotion_score, originality_score, production_score, comment, is_valid) VALUES
    (u6, s1, cat_rap_trap, week_id, 4, 3, 5, NULL, true),
    (u6, s3, cat_pop, week_id, 4, 4, 4, NULL, true),
    (u6, s7, cat_electronic, week_id, 4, 5, 4, 'Les arpeges sont magnifiques', true),
    (u6, s9, cat_rnb, week_id, 5, 4, 5, NULL, true),
    (u6, s13, cat_rock_indie, week_id, 4, 4, 3, NULL, true),
    (u6, s23, cat_jazz, week_id, 5, 5, 4, 'Magnifique', true);

  -- u7 votes for: s3(pop), s5(afro), s9(rnb), s11(lofi), s17(dj), s19(reggae)
  INSERT INTO public.votes (user_id, submission_id, category_id, week_id, emotion_score, originality_score, production_score, comment, is_valid) VALUES
    (u7, s3, cat_pop, week_id, 5, 4, 5, NULL, true),
    (u7, s5, cat_afro, week_id, 4, 5, 4, NULL, true),
    (u7, s9, cat_rnb, week_id, 4, 3, 4, NULL, true),
    (u7, s11, cat_lofi, week_id, 3, 3, 4, NULL, true),
    (u7, s17, cat_dj, week_id, 5, 4, 5, 'Transitions parfaites', true),
    (u7, s19, cat_reggae, week_id, 5, 4, 4, NULL, true);

  -- u8 votes for: s1(rap), s3(pop), s5(afro), s9(rnb), s13(rock), s21(country)
  INSERT INTO public.votes (user_id, submission_id, category_id, week_id, emotion_score, originality_score, production_score, comment, is_valid) VALUES
    (u8, s1, cat_rap_trap, week_id, 5, 4, 4, 'Bien vu le flow', true),
    (u8, s3, cat_pop, week_id, 4, 5, 4, NULL, true),
    (u8, s5, cat_afro, week_id, 4, 3, 5, NULL, true),
    (u8, s9, cat_rnb, week_id, 4, 4, 4, NULL, true),
    (u8, s13, cat_rock_indie, week_id, 3, 4, 5, NULL, true),
    (u8, s21, cat_country, week_id, 4, 3, 4, NULL, true);

  -- u9 votes for: s1(rap), s3(pop), s7(electronic), s11(lofi), s13(rock), s23(jazz)
  INSERT INTO public.votes (user_id, submission_id, category_id, week_id, emotion_score, originality_score, production_score, comment, is_valid) VALUES
    (u9, s1, cat_rap_trap, week_id, 3, 4, 4, NULL, true),
    (u9, s3, cat_pop, week_id, 5, 4, 5, 'Mon favori !', true),
    (u9, s7, cat_electronic, week_id, 4, 4, 5, NULL, true),
    (u9, s11, cat_lofi, week_id, 4, 4, 3, NULL, true),
    (u9, s13, cat_rock_indie, week_id, 4, 4, 3, NULL, true),
    (u9, s23, cat_jazz, week_id, 4, 3, 5, NULL, true);

  -- u10 votes for: s1(rap), s5(afro), s7(electronic), s9(rnb), s17(dj), s19(reggae), s23(jazz)
  INSERT INTO public.votes (user_id, submission_id, category_id, week_id, emotion_score, originality_score, production_score, comment, is_valid) VALUES
    (u10, s1, cat_rap_trap, week_id, 4, 3, 4, NULL, true),
    (u10, s5, cat_afro, week_id, 5, 5, 4, 'Ambiance folle', true),
    (u10, s7, cat_electronic, week_id, 5, 5, 5, NULL, true),
    (u10, s9, cat_rnb, week_id, 3, 4, 4, NULL, true),
    (u10, s17, cat_dj, week_id, 4, 5, 4, NULL, true),
    (u10, s19, cat_reggae, week_id, 4, 4, 3, NULL, true),
    (u10, s23, cat_jazz, week_id, 3, 4, 4, NULL, true);

  RAISE NOTICE 'Seed data inserted: 1 season, 1 week, 1 reward pool, 10 users, 24 submissions, ~65 votes';
END $$;
