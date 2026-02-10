-- ============================================================
-- SEED DATA: Beta demo for Season 1 Week 1
-- 10 demo profiles, 18 demo submissions (2 per category),
-- demo votes with realistic scores, pre-filled stats.
-- ============================================================

BEGIN;

-- ============================================================
-- 1. DEMO USER IDs (deterministic UUIDs for reproducibility)
-- ============================================================
-- We insert directly into auth.users + public.profiles.
-- Password for all demo accounts: DemoPass123!
-- The handle_new_user trigger auto-creates profiles and roles,
-- but we insert users with raw_user_meta_data to set display_name.

DO $$
DECLARE
  demo_users jsonb := '[
    {"id": "d0000000-0000-0000-0000-000000000001", "email": "luna.star@demo.tracktriumph.com",      "name": "Luna Star"},
    {"id": "d0000000-0000-0000-0000-000000000002", "email": "max.beats@demo.tracktriumph.com",      "name": "Max Beats"},
    {"id": "d0000000-0000-0000-0000-000000000003", "email": "nina.chord@demo.tracktriumph.com",     "name": "Nina Chord"},
    {"id": "d0000000-0000-0000-0000-000000000004", "email": "sam.groove@demo.tracktriumph.com",     "name": "Sam Groove"},
    {"id": "d0000000-0000-0000-0000-000000000005", "email": "jade.melody@demo.tracktriumph.com",    "name": "Jade Melody"},
    {"id": "d0000000-0000-0000-0000-000000000006", "email": "alex.synth@demo.tracktriumph.com",     "name": "Alex Synth"},
    {"id": "d0000000-0000-0000-0000-000000000007", "email": "zara.bass@demo.tracktriumph.com",      "name": "Zara Bass"},
    {"id": "d0000000-0000-0000-0000-000000000008", "email": "rio.drums@demo.tracktriumph.com",      "name": "Rio Drums"},
    {"id": "d0000000-0000-0000-0000-000000000009", "email": "cleo.voice@demo.tracktriumph.com",     "name": "Cleo Voice"},
    {"id": "d0000000-0000-0000-0000-00000000000a", "email": "kai.strings@demo.tracktriumph.com",    "name": "Kai Strings"}
  ]';
  u jsonb;
  uid uuid;
BEGIN
  FOR u IN SELECT * FROM jsonb_array_elements(demo_users)
  LOOP
    uid := (u->>'id')::uuid;

    -- Insert into auth.users (only if not already present)
    INSERT INTO auth.users (
      id, instance_id, aud, role, email, encrypted_password,
      email_confirmed_at, raw_user_meta_data, created_at, updated_at,
      confirmation_token, recovery_token, is_super_admin
    )
    VALUES (
      uid,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      u->>'email',
      crypt('DemoPass123!', gen_salt('bf')),
      now(),
      jsonb_build_object('display_name', u->>'name'),
      now() - interval '7 days',
      now() - interval '7 days',
      '',
      '',
      false
    )
    ON CONFLICT (id) DO NOTHING;

    -- The trigger handle_new_user should auto-create profile + role,
    -- but let's ensure profiles exist with richer data
    INSERT INTO public.profiles (id, display_name, bio, avatar_url, social_links, created_at, updated_at)
    VALUES (
      uid,
      u->>'name',
      'Artiste demo pour la beta Track Triumph.',
      'https://api.dicebear.com/9.x/avataaars/svg?seed=' || encode(uid::text::bytea, 'base64'),
      '{}',
      now() - interval '7 days',
      now() - interval '7 days'
    )
    ON CONFLICT (id) DO UPDATE SET
      display_name = EXCLUDED.display_name,
      bio = EXCLUDED.bio,
      avatar_url = EXCLUDED.avatar_url;

    -- Ensure user role exists
    INSERT INTO public.user_roles (user_id, role)
    VALUES (uid, 'user')
    ON CONFLICT (user_id, role) DO NOTHING;
  END LOOP;
END;
$$;

-- ============================================================
-- 2. DEMO SUBMISSIONS (2 per category = 18 tracks)
-- Uses royalty-free placeholder data. Audio URLs point to
-- Supabase storage bucket (demo files uploaded separately).
-- Cover images use picsum.photos placeholders.
-- ============================================================

DO $$
DECLARE
  week_id_val uuid;
  cat_pop uuid;
  cat_rock uuid;
  cat_hiphop uuid;
  cat_electro uuid;
  cat_rnb uuid;
  cat_jazz uuid;
  cat_classique uuid;
  cat_world uuid;
  cat_autres uuid;
BEGIN
  -- Get the active week
  SELECT id INTO week_id_val FROM public.weeks WHERE is_active = true LIMIT 1;
  IF week_id_val IS NULL THEN
    RAISE NOTICE 'No active week found, skipping demo submissions';
    RETURN;
  END IF;

  -- Get category IDs
  SELECT id INTO cat_pop FROM public.categories WHERE slug = 'pop';
  SELECT id INTO cat_rock FROM public.categories WHERE slug = 'rock';
  SELECT id INTO cat_hiphop FROM public.categories WHERE slug = 'hip-hop';
  SELECT id INTO cat_electro FROM public.categories WHERE slug = 'electro';
  SELECT id INTO cat_rnb FROM public.categories WHERE slug = 'rnb';
  SELECT id INTO cat_jazz FROM public.categories WHERE slug = 'jazz';
  SELECT id INTO cat_classique FROM public.categories WHERE slug = 'classique';
  SELECT id INTO cat_world FROM public.categories WHERE slug = 'world';
  SELECT id INTO cat_autres FROM public.categories WHERE slug = 'autres';

  -- ---- POP ----
  INSERT INTO public.submissions (id, user_id, week_id, category_id, title, artist_name, description, tags, audio_excerpt_url, cover_image_url, status, rights_declaration, vote_count, preview_start_sec, preview_end_sec, created_at)
  VALUES
    ('a0000000-0000-0000-0001-000000000001', 'd0000000-0000-0000-0000-000000000001'::uuid, week_id_val, cat_pop,
     'Lumiere d''ete', 'Luna Star',
     'Un morceau pop ensoleille, parfait pour les journees d''ete.',
     ARRAY['pop', 'summer', 'feel-good'],
     'https://cdn.pixabay.com/audio/2024/11/29/audio_d4b291d3c9.mp3',
     'https://picsum.photos/seed/pop1/600/600',
     'approved', true, 0, 0, 30, now() - interval '3 days')
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.submissions (id, user_id, week_id, category_id, title, artist_name, description, tags, audio_excerpt_url, cover_image_url, status, rights_declaration, vote_count, preview_start_sec, preview_end_sec, created_at)
  VALUES
    ('a0000000-0000-0000-0001-000000000002', 'd0000000-0000-0000-0000-000000000005'::uuid, week_id_val, cat_pop,
     'Neon Dreams', 'Jade Melody',
     'Pop electrique aux refrains accrocheurs.',
     ARRAY['pop', 'synth', 'catchy'],
     'https://cdn.pixabay.com/audio/2024/10/16/audio_af51e1c4a3.mp3',
     'https://picsum.photos/seed/pop2/600/600',
     'approved', true, 0, 0, 30, now() - interval '2 days 18 hours')
  ON CONFLICT (id) DO NOTHING;

  -- ---- ROCK ----
  INSERT INTO public.submissions (id, user_id, week_id, category_id, title, artist_name, description, tags, audio_excerpt_url, cover_image_url, status, rights_declaration, vote_count, preview_start_sec, preview_end_sec, created_at)
  VALUES
    ('a0000000-0000-0000-0002-000000000001', 'd0000000-0000-0000-0000-000000000002'::uuid, week_id_val, cat_rock,
     'Voltage', 'Max Beats',
     'Rock alternatif avec des riffs de guitare puissants.',
     ARRAY['rock', 'guitar', 'energy'],
     'https://cdn.pixabay.com/audio/2024/09/19/audio_b0a3a40bfd.mp3',
     'https://picsum.photos/seed/rock1/600/600',
     'approved', true, 0, 0, 30, now() - interval '3 days')
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.submissions (id, user_id, week_id, category_id, title, artist_name, description, tags, audio_excerpt_url, cover_image_url, status, rights_declaration, vote_count, preview_start_sec, preview_end_sec, created_at)
  VALUES
    ('a0000000-0000-0000-0002-000000000002', 'd0000000-0000-0000-0000-000000000008'::uuid, week_id_val, cat_rock,
     'Echoes in the Dark', 'Rio Drums',
     'Un morceau rock sombre et atmospherique.',
     ARRAY['rock', 'dark', 'atmospheric'],
     'https://cdn.pixabay.com/audio/2024/08/02/audio_e2a3b57e8b.mp3',
     'https://picsum.photos/seed/rock2/600/600',
     'approved', true, 0, 0, 30, now() - interval '2 days 12 hours')
  ON CONFLICT (id) DO NOTHING;

  -- ---- HIP-HOP ----
  INSERT INTO public.submissions (id, user_id, week_id, category_id, title, artist_name, description, tags, audio_excerpt_url, cover_image_url, status, rights_declaration, vote_count, preview_start_sec, preview_end_sec, created_at)
  VALUES
    ('a0000000-0000-0000-0003-000000000001', 'd0000000-0000-0000-0000-000000000004'::uuid, week_id_val, cat_hiphop,
     'Flow Nocturne', 'Sam Groove',
     'Hip-hop instrumental avec des basses profondes et un flow unique.',
     ARRAY['hip-hop', 'trap', 'nocturne'],
     'https://cdn.pixabay.com/audio/2024/07/24/audio_d661312a0a.mp3',
     'https://picsum.photos/seed/hiphop1/600/600',
     'approved', true, 0, 0, 30, now() - interval '3 days')
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.submissions (id, user_id, week_id, category_id, title, artist_name, description, tags, audio_excerpt_url, cover_image_url, status, rights_declaration, vote_count, preview_start_sec, preview_end_sec, created_at)
  VALUES
    ('a0000000-0000-0000-0003-000000000002', 'd0000000-0000-0000-0000-000000000007'::uuid, week_id_val, cat_hiphop,
     'Asphalte', 'Zara Bass',
     'Rap francais aux textes incisifs.',
     ARRAY['hip-hop', 'rap-fr', 'lyrical'],
     'https://cdn.pixabay.com/audio/2024/06/26/audio_250a1b1db5.mp3',
     'https://picsum.photos/seed/hiphop2/600/600',
     'approved', true, 0, 0, 30, now() - interval '2 days 6 hours')
  ON CONFLICT (id) DO NOTHING;

  -- ---- ELECTRO ----
  INSERT INTO public.submissions (id, user_id, week_id, category_id, title, artist_name, description, tags, audio_excerpt_url, cover_image_url, status, rights_declaration, vote_count, preview_start_sec, preview_end_sec, created_at)
  VALUES
    ('a0000000-0000-0000-0004-000000000001', 'd0000000-0000-0000-0000-000000000006'::uuid, week_id_val, cat_electro,
     'Pulse', 'Alex Synth',
     'Un morceau electro energique avec des synthes analogiques.',
     ARRAY['electro', 'synth', 'dance'],
     'https://cdn.pixabay.com/audio/2024/11/04/audio_64cfa41e2d.mp3',
     'https://picsum.photos/seed/electro1/600/600',
     'approved', true, 0, 0, 30, now() - interval '3 days')
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.submissions (id, user_id, week_id, category_id, title, artist_name, description, tags, audio_excerpt_url, cover_image_url, status, rights_declaration, vote_count, preview_start_sec, preview_end_sec, created_at)
  VALUES
    ('a0000000-0000-0000-0004-000000000002', 'd0000000-0000-0000-0000-000000000003'::uuid, week_id_val, cat_electro,
     'Circuit', 'Nina Chord',
     'Deep house melodique aux progressions hypnotiques.',
     ARRAY['electro', 'deep-house', 'melodic'],
     'https://cdn.pixabay.com/audio/2024/10/01/audio_1fc3dcb30a.mp3',
     'https://picsum.photos/seed/electro2/600/600',
     'approved', true, 0, 0, 30, now() - interval '2 days')
  ON CONFLICT (id) DO NOTHING;

  -- ---- R&B ----
  INSERT INTO public.submissions (id, user_id, week_id, category_id, title, artist_name, description, tags, audio_excerpt_url, cover_image_url, status, rights_declaration, vote_count, preview_start_sec, preview_end_sec, created_at)
  VALUES
    ('a0000000-0000-0000-0005-000000000001', 'd0000000-0000-0000-0000-000000000009'::uuid, week_id_val, cat_rnb,
     'Velvet Nights', 'Cleo Voice',
     'R&B sensuel avec des harmonies vocales riches.',
     ARRAY['rnb', 'soul', 'vocal'],
     'https://cdn.pixabay.com/audio/2024/08/22/audio_9afe20d0de.mp3',
     'https://picsum.photos/seed/rnb1/600/600',
     'approved', true, 0, 0, 30, now() - interval '3 days')
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.submissions (id, user_id, week_id, category_id, title, artist_name, description, tags, audio_excerpt_url, cover_image_url, status, rights_declaration, vote_count, preview_start_sec, preview_end_sec, created_at)
  VALUES
    ('a0000000-0000-0000-0005-000000000002', 'd0000000-0000-0000-0000-000000000001'::uuid, week_id_val, cat_rnb,
     'Midnight Glow', 'Luna Star',
     'R&B contemporain mele de nuances neo-soul.',
     ARRAY['rnb', 'neo-soul', 'smooth'],
     'https://cdn.pixabay.com/audio/2024/07/10/audio_eb7c1bf5f3.mp3',
     'https://picsum.photos/seed/rnb2/600/600',
     'approved', true, 0, 0, 30, now() - interval '2 days 3 hours')
  ON CONFLICT (id) DO NOTHING;

  -- ---- JAZZ ----
  INSERT INTO public.submissions (id, user_id, week_id, category_id, title, artist_name, description, tags, audio_excerpt_url, cover_image_url, status, rights_declaration, vote_count, preview_start_sec, preview_end_sec, created_at)
  VALUES
    ('a0000000-0000-0000-0006-000000000001', 'd0000000-0000-0000-0000-00000000000a'::uuid, week_id_val, cat_jazz,
     'Blue Notes', 'Kai Strings',
     'Jazz acoustique avec piano et contrebasse.',
     ARRAY['jazz', 'acoustic', 'piano'],
     'https://cdn.pixabay.com/audio/2024/09/12/audio_b5a2f3e8cf.mp3',
     'https://picsum.photos/seed/jazz1/600/600',
     'approved', true, 0, 0, 30, now() - interval '3 days')
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.submissions (id, user_id, week_id, category_id, title, artist_name, description, tags, audio_excerpt_url, cover_image_url, status, rights_declaration, vote_count, preview_start_sec, preview_end_sec, created_at)
  VALUES
    ('a0000000-0000-0000-0006-000000000002', 'd0000000-0000-0000-0000-000000000003'::uuid, week_id_val, cat_jazz,
     'Swing Cafe', 'Nina Chord',
     'Jazz swing anime aux cuivres chaleureux.',
     ARRAY['jazz', 'swing', 'brass'],
     'https://cdn.pixabay.com/audio/2024/06/15/audio_f2e8b1a5d7.mp3',
     'https://picsum.photos/seed/jazz2/600/600',
     'approved', true, 0, 0, 30, now() - interval '2 days 15 hours')
  ON CONFLICT (id) DO NOTHING;

  -- ---- CLASSIQUE ----
  INSERT INTO public.submissions (id, user_id, week_id, category_id, title, artist_name, description, tags, audio_excerpt_url, cover_image_url, status, rights_declaration, vote_count, preview_start_sec, preview_end_sec, created_at)
  VALUES
    ('a0000000-0000-0000-0007-000000000001', 'd0000000-0000-0000-0000-00000000000a'::uuid, week_id_val, cat_classique,
     'Adagio Lumineux', 'Kai Strings',
     'Composition pour orchestre de chambre, violon soliste.',
     ARRAY['classique', 'orchestre', 'violon'],
     'https://cdn.pixabay.com/audio/2024/05/20/audio_c1d7f2e4b8.mp3',
     'https://picsum.photos/seed/classique1/600/600',
     'approved', true, 0, 0, 30, now() - interval '3 days')
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.submissions (id, user_id, week_id, category_id, title, artist_name, description, tags, audio_excerpt_url, cover_image_url, status, rights_declaration, vote_count, preview_start_sec, preview_end_sec, created_at)
  VALUES
    ('a0000000-0000-0000-0007-000000000002', 'd0000000-0000-0000-0000-000000000005'::uuid, week_id_val, cat_classique,
     'Sonate d''Hiver', 'Jade Melody',
     'Piano solo contemporain, melancolique et delicat.',
     ARRAY['classique', 'piano', 'contemporain'],
     'https://cdn.pixabay.com/audio/2024/04/18/audio_a9b3c5d7e1.mp3',
     'https://picsum.photos/seed/classique2/600/600',
     'approved', true, 0, 0, 30, now() - interval '2 days 9 hours')
  ON CONFLICT (id) DO NOTHING;

  -- ---- WORLD ----
  INSERT INTO public.submissions (id, user_id, week_id, category_id, title, artist_name, description, tags, audio_excerpt_url, cover_image_url, status, rights_declaration, vote_count, preview_start_sec, preview_end_sec, created_at)
  VALUES
    ('a0000000-0000-0000-0008-000000000001', 'd0000000-0000-0000-0000-000000000008'::uuid, week_id_val, cat_world,
     'Sahara Groove', 'Rio Drums',
     'Fusion world music avec percussions africaines et guitare desert.',
     ARRAY['world', 'afro', 'desert-blues'],
     'https://cdn.pixabay.com/audio/2024/10/30/audio_e5f8a2b3d1.mp3',
     'https://picsum.photos/seed/world1/600/600',
     'approved', true, 0, 0, 30, now() - interval '3 days')
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.submissions (id, user_id, week_id, category_id, title, artist_name, description, tags, audio_excerpt_url, cover_image_url, status, rights_declaration, vote_count, preview_start_sec, preview_end_sec, created_at)
  VALUES
    ('a0000000-0000-0000-0008-000000000002', 'd0000000-0000-0000-0000-000000000004'::uuid, week_id_val, cat_world,
     'Monsoon', 'Sam Groove',
     'Musique du monde avec sitar, tabla et production moderne.',
     ARRAY['world', 'fusion', 'indian'],
     'https://cdn.pixabay.com/audio/2024/09/25/audio_d3e7f1a5b9.mp3',
     'https://picsum.photos/seed/world2/600/600',
     'approved', true, 0, 0, 30, now() - interval '2 days')
  ON CONFLICT (id) DO NOTHING;

  -- ---- AUTRES ----
  INSERT INTO public.submissions (id, user_id, week_id, category_id, title, artist_name, description, tags, audio_excerpt_url, cover_image_url, status, rights_declaration, vote_count, preview_start_sec, preview_end_sec, created_at)
  VALUES
    ('a0000000-0000-0000-0009-000000000001', 'd0000000-0000-0000-0000-000000000007'::uuid, week_id_val, cat_autres,
     'Fragments', 'Zara Bass',
     'Experimental ambient avec textures electroniques et field recordings.',
     ARRAY['experimental', 'ambient', 'texture'],
     'https://cdn.pixabay.com/audio/2024/08/15/audio_b7c3d5e9f1.mp3',
     'https://picsum.photos/seed/autres1/600/600',
     'approved', true, 0, 0, 30, now() - interval '3 days')
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.submissions (id, user_id, week_id, category_id, title, artist_name, description, tags, audio_excerpt_url, cover_image_url, status, rights_declaration, vote_count, preview_start_sec, preview_end_sec, created_at)
  VALUES
    ('a0000000-0000-0000-0009-000000000002', 'd0000000-0000-0000-0000-000000000009'::uuid, week_id_val, cat_autres,
     'Odyssey', 'Cleo Voice',
     'Fusion de genres: spoken word, lo-fi et jazz electronique.',
     ARRAY['experimental', 'spoken-word', 'lo-fi'],
     'https://cdn.pixabay.com/audio/2024/07/05/audio_a1e3f5b7d9.mp3',
     'https://picsum.photos/seed/autres2/600/600',
     'approved', true, 0, 0, 30, now() - interval '2 days 21 hours')
  ON CONFLICT (id) DO NOTHING;

END;
$$;

-- ============================================================
-- 3. DEMO VOTES (cross-voting between demo users)
-- Each demo user votes for submissions in categories they
-- didn't submit in. Realistic score distribution.
-- ============================================================

DO $$
DECLARE
  week_id_val uuid;
  -- Submission IDs (from above)
  sub_ids text[] := ARRAY[
    'a0000000-0000-0000-0001-000000000001', -- pop 1 (user 1)
    'a0000000-0000-0000-0001-000000000002', -- pop 2 (user 5)
    'a0000000-0000-0000-0002-000000000001', -- rock 1 (user 2)
    'a0000000-0000-0000-0002-000000000002', -- rock 2 (user 8)
    'a0000000-0000-0000-0003-000000000001', -- hiphop 1 (user 4)
    'a0000000-0000-0000-0003-000000000002', -- hiphop 2 (user 7)
    'a0000000-0000-0000-0004-000000000001', -- electro 1 (user 6)
    'a0000000-0000-0000-0004-000000000002', -- electro 2 (user 3)
    'a0000000-0000-0000-0005-000000000001', -- rnb 1 (user 9)
    'a0000000-0000-0000-0005-000000000002', -- rnb 2 (user 1)
    'a0000000-0000-0000-0006-000000000001', -- jazz 1 (user 10)
    'a0000000-0000-0000-0006-000000000002', -- jazz 2 (user 3)
    'a0000000-0000-0000-0007-000000000001', -- classique 1 (user 10)
    'a0000000-0000-0000-0007-000000000002', -- classique 2 (user 5)
    'a0000000-0000-0000-0008-000000000001', -- world 1 (user 8)
    'a0000000-0000-0000-0008-000000000002', -- world 2 (user 4)
    'a0000000-0000-0000-0009-000000000001', -- autres 1 (user 7)
    'a0000000-0000-0000-0009-000000000002'  -- autres 2 (user 9)
  ];
  voter_ids text[] := ARRAY[
    'd0000000-0000-0000-0000-000000000001',
    'd0000000-0000-0000-0000-000000000002',
    'd0000000-0000-0000-0000-000000000003',
    'd0000000-0000-0000-0000-000000000004',
    'd0000000-0000-0000-0000-000000000005',
    'd0000000-0000-0000-0000-000000000006',
    'd0000000-0000-0000-0000-000000000007',
    'd0000000-0000-0000-0000-000000000008',
    'd0000000-0000-0000-0000-000000000009',
    'd0000000-0000-0000-0000-00000000000a'
  ];
  sub_rec record;
  voter_id uuid;
  cat_id uuid;
  emo int;
  orig int;
  prod int;
  i int;
BEGIN
  SELECT id INTO week_id_val FROM public.weeks WHERE is_active = true LIMIT 1;
  IF week_id_val IS NULL THEN RETURN; END IF;

  -- For each submission, create votes from users who didn't create it
  -- We want each user to vote in each category (1 vote per category per week)
  -- So for each category, pick a submission and assign voters

  -- Strategy: For each of the 9 categories, pick the first submission,
  -- and have ~5 different users vote for it
  FOR i IN 1..18 LOOP
    -- Get submission details
    SELECT s.id AS sid, s.user_id AS suid, s.category_id AS scid
    INTO sub_rec
    FROM public.submissions s
    WHERE s.id = sub_ids[i]::uuid;

    IF sub_rec IS NULL THEN CONTINUE; END IF;

    -- Have up to 5 voters vote for this submission
    -- Skip if voter already voted in this category this week
    DECLARE
      j int;
      v_uid uuid;
    BEGIN
      FOR j IN 1..5 LOOP
        -- Pick a voter who is NOT the submission owner
        -- Cycle through voters using offset
        v_uid := voter_ids[((i + j - 1) % 10) + 1]::uuid;

        -- Skip if this voter owns this submission
        IF v_uid = sub_rec.suid THEN CONTINUE; END IF;

        -- Skip if voter already voted this category this week
        IF EXISTS (
          SELECT 1 FROM public.votes
          WHERE user_id = v_uid AND category_id = sub_rec.scid AND week_id = week_id_val
        ) THEN CONTINUE; END IF;

        -- Generate realistic scores (3-5 range with some variation)
        emo := 3 + floor(random() * 3)::int;
        orig := 3 + floor(random() * 3)::int;
        prod := 3 + floor(random() * 3)::int;

        INSERT INTO public.votes (user_id, submission_id, week_id, category_id, emotion_score, originality_score, production_score, is_valid, created_at)
        VALUES (v_uid, sub_rec.sid, week_id_val, sub_rec.scid, emo, orig, prod, true, now() - interval '1 day' + (j * interval '2 hours'))
        ON CONFLICT (user_id, category_id, week_id) DO NOTHING;
      END LOOP;
    END;
  END LOOP;

  -- Update vote_count on submissions based on actual votes
  UPDATE public.submissions s
  SET vote_count = (
    SELECT count(*) FROM public.votes v
    WHERE v.submission_id = s.id AND v.is_valid = true
  )
  WHERE s.id = ANY(
    SELECT unnest(sub_ids::uuid[])
  );

END;
$$;

-- ============================================================
-- 4. REWARD POOL for Week 1
-- ============================================================
INSERT INTO public.reward_pools (week_id, minimum_cents, current_cents, top1_amount_cents, top2_amount_cents, top3_amount_cents, status, fallback_label, sponsors)
SELECT
  w.id,
  35000,  -- 350 EUR minimum
  35000,  -- 350 EUR current
  20000,  -- 200 EUR 1st
  10000,  -- 100 EUR 2nd
  5000,   -- 50 EUR 3rd
  'active',
  'Recompenses confirmees pour la Semaine 1',
  '[{"name": "Track Triumph", "url": "https://weeklymusicawards.com"}]'::jsonb
FROM public.weeks w
WHERE w.is_active = true
ON CONFLICT (week_id) DO UPDATE SET
  current_cents = 35000,
  top1_amount_cents = 20000,
  top2_amount_cents = 10000,
  top3_amount_cents = 5000,
  status = 'active';

COMMIT;
