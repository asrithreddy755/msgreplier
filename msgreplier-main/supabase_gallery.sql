-- ============================================================
-- Wishes Website Gallery — Database Schema
-- Run this in the Supabase SQL Editor to support the Gallery tab
-- ============================================================

-- Create the user_gallery table
CREATE TABLE IF NOT EXISTS public.user_gallery (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  image_url    TEXT NOT NULL,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast lookups by user_id
CREATE INDEX IF NOT EXISTS idx_user_gallery_user_id
  ON public.user_gallery(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.user_gallery ENABLE ROW LEVEL SECURITY;

-- 1. Select policy: Users can only see their own gallery images
DROP POLICY IF EXISTS "Users can view own gallery" ON public.user_gallery;
CREATE POLICY "Users can view own gallery"
  ON public.user_gallery FOR SELECT
  USING (auth.uid() = user_id);

-- 2. Insert policy: Users can only insert images for their own account
DROP POLICY IF EXISTS "Users can insert own gallery" ON public.user_gallery;
CREATE POLICY "Users can insert own gallery"
  ON public.user_gallery FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 3. Delete policy: Users can only delete their own gallery images
DROP POLICY IF EXISTS "Users can delete own gallery" ON public.user_gallery;
CREATE POLICY "Users can delete own gallery"
  ON public.user_gallery FOR DELETE
  USING (auth.uid() = user_id);
