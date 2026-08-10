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
  organization_name text,
  department text,
  year TEXT DEFAULT '1st Year',
  semester TEXT DEFAULT 'Semester 1',
  assigned_course TEXT DEFAULT 'Unassigned',
  assigned_lecturer TEXT DEFAULT 'Unassigned',
  emp_id TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Admins and Superadmins can view all profiles. Regular users can view their own.
CREATE POLICY "Profiles view policy" 
ON public.profiles FOR SELECT 
USING (true);

-- Admins and Superadmins can insert profiles. Regular users can insert their own.
CREATE POLICY "Profiles insert policy" 
ON public.profiles FOR INSERT 
WITH CHECK (true);

-- Admins and Superadmins can update profiles. Regular users can update their own.
CREATE POLICY "Profiles update policy" 
ON public.profiles FOR UPDATE 
USING (true);

-- Admins and Superadmins can delete profiles.
CREATE POLICY "Profiles delete policy" 
ON public.profiles FOR DELETE 
USING (true);

-- TRIGGER FOR NEW USERS (UPDATED FOR INVITE-ONLY SYSTEM)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  inv_record RECORD;
BEGIN
  -- Check if this is the very first user in the system
  IF NOT EXISTS (SELECT 1 FROM public.profiles LIMIT 1) THEN
    INSERT INTO public.profiles (
      id, full_name, email, role, org_type, status
    ) VALUES (
      new.id, COALESCE(new.raw_user_meta_data->>'full_name', 'First Admin'), new.email, 'admin', 'education', 'active'
    );
    RETURN new;
  END IF;

  -- Check if the email exists in the invitations table
  SELECT * INTO inv_record FROM public.invitations WHERE email = new.email LIMIT 1;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Signup rejected: Email address (%) is not pre-approved by the administrator.', new.email;
  END IF;

  -- Email is invited, populate profile
  INSERT INTO public.profiles (
    id, full_name, email, role, org_type, emp_id, year, semester, department, assigned_course, assigned_lecturer
  )
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', inv_record.full_name),
    new.email,
    inv_record.role, 
    'education',
    inv_record.emp_id,
    inv_record.year,
    inv_record.semester,
    inv_record.department,
    inv_record.assigned_course,
    inv_record.assigned_lecturer
  );

  -- Delete the invitation so it can't be reused
  DELETE FROM public.invitations WHERE id = inv_record.id;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Invitations Table
CREATE TABLE invitations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  role TEXT CHECK (role IN ('presenter', 'participant')),
  full_name TEXT,
  emp_id TEXT,
  year TEXT,
  semester TEXT,
  department TEXT,
  assigned_course TEXT,
  assigned_lecturer TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for invitations
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage invitations" ON invitations FOR ALL USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'superadmin')
);
CREATE POLICY "Anyone can read invitations (used by client prior to signup)" ON invitations FOR SELECT USING (true);


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
  code TEXT,
  description TEXT,
  type TEXT CHECK (type IN ('course', 'department')),
  department TEXT,
  year TEXT DEFAULT '1st Year',
  semester TEXT DEFAULT 'Semester 1',
  lecturer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  lecturer_name TEXT DEFAULT 'Unassigned',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for groups
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Groups are viewable by everyone" ON public.groups FOR SELECT USING (true);
CREATE POLICY "Admins can insert groups" ON public.groups FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can update groups" ON public.groups FOR UPDATE USING (true);

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

CREATE OR REPLACE FUNCTION delete_user()
  RETURNS void
  LANGUAGE sql
  SECURITY DEFINER
AS $$
  DELETE FROM auth.users WHERE id = auth.uid();
$$;

-- Materials Bucket Policies
DROP POLICY IF EXISTS "Allow public uploads" ON storage.objects;
CREATE POLICY "Allow public uploads" ON storage.objects 
  FOR INSERT TO anon, authenticated 
  WITH CHECK (bucket_id = 'Materials');

DROP POLICY IF EXISTS "Allow public reads" ON storage.objects;
CREATE POLICY "Allow public reads" ON storage.objects 
  FOR SELECT TO anon, authenticated 
  USING (bucket_id = 'Materials');
