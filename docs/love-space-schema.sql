-- Love Space Database Schema
-- Run this in your Supabase SQL Editor

-- 1) love_rooms
CREATE TABLE public.love_rooms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  status TEXT DEFAULT 'active'::text NOT NULL,
  created_by TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + interval '24 hours') NOT NULL
);

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

-- Enable Realtime for love_messages
alter publication supabase_realtime add table public.love_messages;


-- 4) love_games
CREATE TABLE public.love_games (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID REFERENCES public.love_rooms(id) ON DELETE CASCADE NOT NULL,
  game_type TEXT NOT NULL, -- 'xox', 'truth', 'snake'
  game_state JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.love_games ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can manage games" ON public.love_games
  FOR ALL USING (true);

-- Enable Realtime for love_games (optional, we might mostly use broadcast, but good to have)
alter publication supabase_realtime add table public.love_games;
