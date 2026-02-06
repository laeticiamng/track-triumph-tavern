
-- 1. ALL ENUMS
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');
CREATE TYPE public.submission_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE public.reward_pool_status AS ENUM ('active', 'inactive', 'threshold_met');

-- 2. user_roles TABLE (must exist before has_role function)
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL DEFAULT 'user',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 3. has_role FUNCTION (security definer)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- 4. REMAINING TABLES
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text,
  avatar_url text,
  bio text,
  banner_url text,
  social_links jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.seasons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  start_date date NOT NULL,
  end_date date,
  is_active boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.seasons ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  icon text,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.weeks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  season_id uuid NOT NULL REFERENCES public.seasons(id) ON DELETE CASCADE,
  week_number int NOT NULL,
  title text,
  submission_open_at timestamptz NOT NULL,
  submission_close_at timestamptz NOT NULL,
  voting_open_at timestamptz NOT NULL,
  voting_close_at timestamptz NOT NULL,
  results_published_at timestamptz,
  is_active boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (season_id, week_number)
);
ALTER TABLE public.weeks ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  week_id uuid NOT NULL REFERENCES public.weeks(id) ON DELETE CASCADE,
  category_id uuid NOT NULL REFERENCES public.categories(id),
  title text NOT NULL,
  artist_name text NOT NULL,
  description text,
  tags text[] DEFAULT '{}',
  audio_excerpt_url text NOT NULL,
  cover_image_url text NOT NULL,
  external_url text,
  status public.submission_status NOT NULL DEFAULT 'pending',
  rights_declaration boolean NOT NULL DEFAULT false,
  rejection_reason text,
  vote_count int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  submission_id uuid NOT NULL REFERENCES public.submissions(id) ON DELETE CASCADE,
  week_id uuid NOT NULL REFERENCES public.weeks(id) ON DELETE CASCADE,
  category_id uuid NOT NULL REFERENCES public.categories(id),
  originality_score int CHECK (originality_score BETWEEN 1 AND 5),
  production_score int CHECK (production_score BETWEEN 1 AND 5),
  emotion_score int CHECK (emotion_score BETWEEN 1 AND 5),
  comment text,
  is_valid boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, category_id, week_id)
);
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.vote_events (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  vote_id uuid NOT NULL REFERENCES public.votes(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ip_address inet,
  user_agent text,
  event_type text NOT NULL DEFAULT 'cast',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.vote_events ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.reward_pools (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  week_id uuid NOT NULL REFERENCES public.weeks(id) ON DELETE CASCADE UNIQUE,
  minimum_cents bigint NOT NULL DEFAULT 0,
  current_cents bigint NOT NULL DEFAULT 0,
  status public.reward_pool_status NOT NULL DEFAULT 'inactive',
  sponsors jsonb DEFAULT '[]',
  fallback_label text DEFAULT 'Récompenses alternatives disponibles',
  top1_amount_cents bigint NOT NULL DEFAULT 0,
  top2_amount_cents bigint NOT NULL DEFAULT 0,
  top3_amount_cents bigint NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.reward_pools ENABLE ROW LEVEL SECURITY;

-- 5. INDEXES
CREATE INDEX idx_submissions_week ON public.submissions(week_id);
CREATE INDEX idx_submissions_category ON public.submissions(category_id);
CREATE INDEX idx_submissions_user ON public.submissions(user_id);
CREATE INDEX idx_submissions_status ON public.submissions(status);
CREATE INDEX idx_votes_submission ON public.votes(submission_id);
CREATE INDEX idx_votes_week ON public.votes(week_id);
CREATE INDEX idx_votes_user ON public.votes(user_id);
CREATE INDEX idx_vote_events_vote ON public.vote_events(vote_id);
CREATE INDEX idx_weeks_season ON public.weeks(season_id);
CREATE INDEX idx_weeks_active ON public.weeks(is_active);

-- 6. TRIGGERS
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_submissions_updated_at BEFORE UPDATE ON public.submissions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_reward_pools_updated_at BEFORE UPDATE ON public.reward_pools FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 7. AUTO-CREATE PROFILE + ROLE ON SIGNUP
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)));
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 8. RLS POLICIES

-- user_roles
CREATE POLICY "Users can view own role" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all roles" ON public.user_roles FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- profiles
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- seasons
CREATE POLICY "Seasons are viewable by everyone" ON public.seasons FOR SELECT USING (true);
CREATE POLICY "Admins can manage seasons" ON public.seasons FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- categories
CREATE POLICY "Categories are viewable by everyone" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Admins can manage categories" ON public.categories FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- weeks
CREATE POLICY "Weeks are viewable by everyone" ON public.weeks FOR SELECT USING (true);
CREATE POLICY "Admins can manage weeks" ON public.weeks FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- submissions
CREATE POLICY "Anyone can view approved submissions" ON public.submissions FOR SELECT USING (status = 'approved');
CREATE POLICY "Users can view own submissions" ON public.submissions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Moderators can view all submissions" ON public.submissions FOR SELECT USING (public.has_role(auth.uid(), 'moderator') OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Authenticated users can submit" ON public.submissions FOR INSERT WITH CHECK (auth.uid() = user_id AND rights_declaration = true);
CREATE POLICY "Users can update own pending submissions" ON public.submissions FOR UPDATE USING (auth.uid() = user_id AND status = 'pending');
CREATE POLICY "Moderators can update submissions" ON public.submissions FOR UPDATE USING (public.has_role(auth.uid(), 'moderator') OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can delete own pending submissions" ON public.submissions FOR DELETE USING (auth.uid() = user_id AND status = 'pending');

-- votes
CREATE POLICY "Users can view own votes" ON public.votes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all votes" ON public.votes FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Authenticated users can vote" ON public.votes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own votes" ON public.votes FOR UPDATE USING (auth.uid() = user_id);

-- vote_events
CREATE POLICY "Admins can view vote events" ON public.vote_events FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "System can insert vote events" ON public.vote_events FOR INSERT WITH CHECK (auth.uid() = user_id);

-- reward_pools
CREATE POLICY "Reward pools are viewable by everyone" ON public.reward_pools FOR SELECT USING (true);
CREATE POLICY "Admins can manage reward pools" ON public.reward_pools FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- 9. STORAGE BUCKETS
INSERT INTO storage.buckets (id, name, public) VALUES ('audio-excerpts', 'audio-excerpts', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('cover-images', 'cover-images', true);

CREATE POLICY "Anyone can view audio excerpts" ON storage.objects FOR SELECT USING (bucket_id = 'audio-excerpts');
CREATE POLICY "Auth users can upload audio" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'audio-excerpts' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can delete own audio" ON storage.objects FOR DELETE USING (bucket_id = 'audio-excerpts' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Anyone can view covers" ON storage.objects FOR SELECT USING (bucket_id = 'cover-images');
CREATE POLICY "Auth users can upload covers" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'cover-images' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can delete own covers" ON storage.objects FOR DELETE USING (bucket_id = 'cover-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- 10. SEED DATA
INSERT INTO public.categories (name, slug, icon, sort_order) VALUES
  ('Rap / Trap', 'rap-trap', 'mic-2', 1),
  ('Pop', 'pop', 'music', 2),
  ('Afro', 'afro', 'globe', 3),
  ('Electronic', 'electronic', 'zap', 4),
  ('R&B', 'rnb', 'heart', 5),
  ('Lofi', 'lofi', 'headphones', 6),
  ('Rock / Indé', 'rock-indie', 'guitar', 7),
  ('Open', 'open', 'waves', 8);

INSERT INTO public.seasons (name, start_date, end_date, is_active) VALUES
  ('Saison 1', '2026-02-01', '2026-07-31', true);

INSERT INTO public.weeks (season_id, week_number, title, submission_open_at, submission_close_at, voting_open_at, voting_close_at, is_active)
SELECT s.id, 1, 'Semaine 1',
  '2026-02-03T00:00:00Z', '2026-02-07T23:59:59Z',
  '2026-02-08T00:00:00Z', '2026-02-12T23:59:59Z',
  true
FROM public.seasons s WHERE s.name = 'Saison 1';
