-- Add preview window columns to submissions table
-- These store the 30-second preview start/end positions selected by the artist
ALTER TABLE public.submissions
  ADD COLUMN IF NOT EXISTS preview_start_sec numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS preview_end_sec numeric DEFAULT 30;
