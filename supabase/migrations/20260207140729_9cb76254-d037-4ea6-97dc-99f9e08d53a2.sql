
-- Add new columns to categories
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS sub_genres text[] DEFAULT '{}';
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS mood_tags text[] DEFAULT '{}';
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS fun_fact text;
