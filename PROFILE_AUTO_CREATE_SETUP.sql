-- ================================================
-- AUTO-CREATE PROFILES ON SIGNUP
-- ================================================
-- Run this SQL in your Supabase SQL Editor
-- ================================================

-- 1. Ensure profiles table exists with proper structure
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT,
  role TEXT,
  region TEXT,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create a function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, role, region, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'User'),
    COALESCE(NEW.raw_user_meta_data->>'region', 'Unknown'),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NULL)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Create a trigger to automatically create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 4. Create a function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. Create trigger to auto-update updated_at on profile changes
DROP TRIGGER IF EXISTS on_profile_updated ON public.profiles;
CREATE TRIGGER on_profile_updated
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- 6. Enable RLS on profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 7. Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can read all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

-- 8. Create RLS policies
CREATE POLICY "Users can read all profiles"
ON public.profiles FOR SELECT
USING (true);

CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = id);

-- 9. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_region ON public.profiles(region);

-- 10. Enable Realtime for profiles (optional, for real-time profile updates)
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;

-- ================================================
-- VERIFICATION QUERIES
-- ================================================

-- Check if function exists
SELECT proname FROM pg_proc WHERE proname = 'handle_new_user';

-- Check if trigger exists
SELECT tgname FROM pg_trigger WHERE tgname = 'on_auth_user_created';

-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'profiles';

-- Check if realtime is enabled
SELECT tablename FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime' AND tablename = 'profiles';

-- Test: View all profiles
SELECT id, username, role, region, created_at FROM public.profiles;

-- ================================================
-- OPTIONAL: Backfill existing users
-- ================================================
-- If you have existing auth users without profiles, run this:

INSERT INTO public.profiles (id, username, role, region)
SELECT 
  au.id,
  COALESCE(au.raw_user_meta_data->>'username', split_part(au.email, '@', 1)) as username,
  COALESCE(au.raw_user_meta_data->>'role', 'User') as role,
  COALESCE(au.raw_user_meta_data->>'region', 'Unknown') as region
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL;

-- ================================================
-- NOTES
-- ================================================
-- 1. When a user signs up, their profile is automatically created
-- 2. Username defaults to email prefix if not provided
-- 3. Role defaults to 'User' if not provided
-- 4. Region defaults to 'Unknown' if not provided
-- 5. Avatar URL can be added later via profile update
-- 6. All users can read all profiles (for displaying authors)
-- 7. Users can only update their own profile




