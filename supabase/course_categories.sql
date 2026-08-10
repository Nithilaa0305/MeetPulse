-- MeetPulse Course Categorization SQL Migration
-- 1. Add missing columns to groups table for course categorization
ALTER TABLE public.groups 
ADD COLUMN IF NOT EXISTS year TEXT DEFAULT '1st Year',
ADD COLUMN IF NOT EXISTS semester TEXT DEFAULT 'Semester 1',
ADD COLUMN IF NOT EXISTS lecturer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS lecturer_name TEXT DEFAULT 'Unassigned';

-- NOTE: we add lecturer_name so we don't have to join profiles if we don't want to for simple queries,
-- though ideally lecturer_id is sufficient. For backwards compatibility with the UI, storing lecturer_name is helpful.

-- 2. Ensure RLS policies on groups are correct
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;

-- Allow everyone to view groups
DROP POLICY IF EXISTS "Groups are viewable by everyone" ON public.groups;
CREATE POLICY "Groups are viewable by everyone" ON public.groups FOR SELECT USING (true);

-- Ensure admins can insert/update groups (which was done in the previous migration, just ensuring it's robust)
DROP POLICY IF EXISTS "Admins can insert groups" ON public.groups;
CREATE POLICY "Admins can insert groups" ON public.groups FOR INSERT WITH CHECK (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'superadmin')
);

DROP POLICY IF EXISTS "Admins can update groups" ON public.groups;
CREATE POLICY "Admins can update groups" ON public.groups FOR UPDATE USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'superadmin')
);
