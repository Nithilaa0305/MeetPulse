-- MeetPulse Student Categorization SQL Migration
-- Add missing columns to profiles table for student categorization
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS year TEXT DEFAULT '1st Year',
ADD COLUMN IF NOT EXISTS semester TEXT DEFAULT 'Semester 1',
ADD COLUMN IF NOT EXISTS assigned_course TEXT DEFAULT 'Unassigned',
ADD COLUMN IF NOT EXISTS assigned_lecturer TEXT DEFAULT 'Unassigned',
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';
