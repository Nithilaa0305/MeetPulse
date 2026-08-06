-- MeetPulse Initial PostgreSQL Schema for Supabase

DROP TABLE IF EXISTS attendance CASCADE;
DROP TABLE IF EXISTS meetings CASCADE;
DROP TABLE IF EXISTS groups CASCADE;
DROP TABLE IF EXISTS organizations CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;


-- 1. Profiles Table (extends default auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  full_name TEXT,
  email TEXT UNIQUE NOT NULL,
  role TEXT CHECK (role IN ('admin', 'presenter', 'participant', 'superadmin')),
  org_type TEXT CHECK (org_type IN ('education', 'business')),
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles are viewable by everyone." ON profiles FOR SELECT USING (true);


-- TRIGGER FOR NEW USERS
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role, org_type)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.email,
    'participant', 
    'education'    
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 2. Organizations Table
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('education', 'business')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Courses / Departments Table
CREATE TABLE groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT CHECK (type IN ('course', 'department')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Meetings / Sessions Table
CREATE TABLE meetings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  group_id UUID REFERENCES groups(id) ON DELETE SET NULL,
  presenter_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  platform TEXT, 
  status TEXT CHECK (status IN ('scheduled', 'live', 'ended')),
  scheduled_start TIMESTAMP WITH TIME ZONE,
  materials JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for meetings
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Meetings are viewable by org members." ON meetings FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON meetings FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for authenticated users" ON meetings FOR UPDATE USING (true);
CREATE POLICY "Enable delete for authenticated users" ON meetings FOR DELETE USING (true);

-- 5. Attendance Table
CREATE TABLE attendance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  meeting_id UUID REFERENCES meetings(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  join_time TIMESTAMP WITH TIME ZONE,
  leave_time TIMESTAMP WITH TIME ZONE,
  engagement_score INTEGER DEFAULT 0,
  status TEXT CHECK (status IN ('present', 'late', 'absent'))
);

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS organization_name text,
ADD COLUMN IF NOT EXISTS department text,
ADD COLUMN IF NOT EXISTS org_type text,
ADD COLUMN IF NOT EXISTS role text,
ADD COLUMN IF NOT EXISTS full_name text;

-- 1. Drop all existing policies on the profiles table to clear the infinite recursion
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile." ON profiles;
DROP POLICY IF EXISTS "Users can update own profile." ON profiles;
-- Add any other DROP POLICY commands here if you know the custom names you used, 
-- or you can manually delete them from the Authentication -> Policies tab in Supabase.

-- 2. Make sure RLS is enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. Create safe, non-recursive policies
CREATE POLICY "Users can view their own profile" 
ON public.profiles FOR SELECT 
USING ( auth.uid() = id );

CREATE POLICY "Users can insert their own profile" 
ON public.profiles FOR INSERT 
WITH CHECK ( auth.uid() = id );

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE 
USING ( auth.uid() = id );

CREATE OR REPLACE FUNCTION delete_user()
  RETURNS void
  LANGUAGE sql
  SECURITY DEFINER
AS $$
  DELETE FROM auth.users WHERE id = auth.uid();
$$;
