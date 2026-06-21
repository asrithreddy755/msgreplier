-- ============================================================
-- Wishes Website Auth — Database Schema
-- Run this in the Supabase SQL Editor
-- ============================================================

-- 1. Add user_id column to existing love_greetings table
--    (links greetings created by logged-in users to their account)
--    Anonymous greetings keep working — user_id will simply be NULL
ALTER TABLE public.love_greetings
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- 2. Index for fast dashboard queries (fetching by user)
CREATE INDEX IF NOT EXISTS idx_love_greetings_user_id
  ON public.love_greetings(user_id);

-- ============================================================
-- Profiles table — one row per user, auto-created on signup
-- ============================================================

CREATE TABLE IF NOT EXISTS public.profiles (
  id           UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email        TEXT,
  display_name TEXT,
  avatar_url   TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- ============================================================
-- Trigger: auto-create a profile row when a user signs up
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Drop and recreate to avoid duplicate trigger issues
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- Additional RLS policies on love_greetings for authenticated users
-- (existing public read + insert policies are kept intact)
-- ============================================================

-- Users can update their own greetings
DROP POLICY IF EXISTS "Users can update own greetings" ON public.love_greetings;
CREATE POLICY "Users can update own greetings"
  ON public.love_greetings FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own greetings
DROP POLICY IF EXISTS "Users can delete own greetings" ON public.love_greetings;
CREATE POLICY "Users can delete own greetings"
  ON public.love_greetings FOR DELETE
  USING (auth.uid() = user_id);
