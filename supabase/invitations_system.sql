-- MeetPulse SQL Migration: Invitations & Explicit Codes

-- 1. Add new columns to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS emp_id TEXT;

-- 2. Add new columns to groups
ALTER TABLE public.groups
ADD COLUMN IF NOT EXISTS code TEXT;

-- 3. Create Invitations Table
CREATE TABLE IF NOT EXISTS public.invitations (
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
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Enable RLS and create policies for Invitations
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can manage invitations" ON public.invitations;
CREATE POLICY "Admins can manage invitations" ON public.invitations FOR ALL USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Anyone can read invitations" ON public.invitations;
CREATE POLICY "Anyone can read invitations" ON public.invitations FOR SELECT USING (true);


-- 5. Update Auth Trigger to use Invitations and Enforce Invite-Only
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
