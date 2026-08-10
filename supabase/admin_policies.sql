-- MeetPulse Admin Dashboard SQL Migration
-- 1. Add missing columns to profiles table for dashboard functionality
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS assigned_course TEXT DEFAULT 'Unassigned',
ADD COLUMN IF NOT EXISTS assigned_lecturer TEXT DEFAULT 'Unassigned',
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended'));

-- 2. Update RLS policies to allow admins to see and manage other users in their organization
-- Note: 'superadmin' can see everything. 'admin' can see users in their org_type.

-- Drop existing SELECT policy if it restricts to own profile
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

-- Create new SELECT policy:
-- Users can see their own profile. Admins and Superadmins can see everyone's profile.
CREATE POLICY "Admins can view all profiles, users can view their own" 
ON public.profiles FOR SELECT 
USING (
  auth.uid() = id OR 
  (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'superadmin')
);

-- Drop existing UPDATE policy if it restricts to own profile
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- Create new UPDATE policy:
-- Users can update their own profile. Admins and Superadmins can update other profiles.
CREATE POLICY "Admins can update all profiles, users can update their own" 
ON public.profiles FOR UPDATE
USING (
  auth.uid() = id OR 
  (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'superadmin')
);

-- Ensure RLS is enabled for groups (if it exists and is used)
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Groups are viewable by everyone" ON public.groups;
CREATE POLICY "Groups are viewable by everyone" ON public.groups FOR SELECT USING (true);
CREATE POLICY "Admins can insert groups" ON public.groups FOR INSERT WITH CHECK (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'superadmin')
);
CREATE POLICY "Admins can update groups" ON public.groups FOR UPDATE USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'superadmin')
);

-- Ensure RLS is enabled for organizations (if it exists and is used)
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Orgs are viewable by everyone" ON public.organizations;
CREATE POLICY "Orgs are viewable by everyone" ON public.organizations FOR SELECT USING (true);
