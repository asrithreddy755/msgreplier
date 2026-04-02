-- Love Space Database Schema
-- Run this in your Supabase SQL Editor

-- 1) love_rooms
CREATE TABLE public.love_rooms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  status TEXT DEFAULT 'active'::text NOT NULL,
  created_by TEXT NOT NULL, -- The nickname of the person who created the room
  room_code TEXT UNIQUE, -- 5-digit code for joining the room
  is_active BOOLEAN DEFAULT true NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + interval '24 hours') NOT NULL
);
-- Index for room_code
CREATE UNIQUE INDEX IF NOT EXISTS love_rooms_room_code_idx ON love_rooms(room_code);

-- Enable RLS
ALTER TABLE public.love_rooms ENABLE ROW LEVEL SECURITY;

-- Allow anyone to create rooms
CREATE POLICY "Anyone can create rooms" ON public.love_rooms
  FOR INSERT WITH CHECK (true);

-- Allow public read access to rooms (so users can join via link)
CREATE POLICY "Anyone can read rooms" ON public.love_rooms
  FOR SELECT USING (true);


-- 2) love_room_members
CREATE TABLE public.love_room_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID REFERENCES public.love_rooms(id) ON DELETE CASCADE NOT NULL,
  nickname TEXT NOT NULL,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.love_room_members ENABLE ROW LEVEL SECURITY;

-- Allow insert
CREATE POLICY "Anyone can join rooms" ON public.love_room_members
  FOR INSERT WITH CHECK (true);

-- Allow reading members of a room
CREATE POLICY "Anyone can read members" ON public.love_room_members
  FOR SELECT USING (true);


-- 3) love_messages
CREATE TABLE public.love_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID REFERENCES public.love_rooms(id) ON DELETE CASCADE NOT NULL,
  sender_nickname TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.love_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert messages" ON public.love_messages
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can read messages" ON public.love_messages
  FOR SELECT USING (true);


-- 4) love_games
CREATE TABLE public.love_games (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID REFERENCES public.love_rooms(id) ON DELETE CASCADE NOT NULL,
  game_type TEXT NOT NULL, -- 'xox', 'truth', 'snake', 'ludo'
  game_state JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(room_id, game_type)
);

-- Enable RLS
ALTER TABLE public.love_games ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can manage games" ON public.love_games
  FOR ALL USING (true);


-- 5) love_quizzes
CREATE TABLE IF NOT EXISTS public.love_quizzes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_name TEXT NOT NULL,
  receiver_name TEXT NOT NULL,
  time_limit_seconds INTEGER NOT NULL DEFAULT 60,
  questions JSONB NOT NULL,
  score INTEGER,
  status TEXT DEFAULT 'pending'::text NOT NULL,
  taker_id TEXT,
  taker_answers JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.love_quizzes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create quizzes" ON public.love_quizzes
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can read quizzes" ON public.love_quizzes
  FOR SELECT USING (true);

CREATE POLICY "Anyone can update quizzes" ON public.love_quizzes
  FOR UPDATE USING (true);
