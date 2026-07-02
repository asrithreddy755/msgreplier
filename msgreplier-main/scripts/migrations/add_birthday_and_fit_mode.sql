-- Migration: Add birthday_date and fit_mode columns to love_greetings table
ALTER TABLE public.love_greetings ADD COLUMN IF NOT EXISTS birthday_date TEXT;
ALTER TABLE public.love_greetings ADD COLUMN IF NOT EXISTS fit_mode TEXT DEFAULT 'cover';
