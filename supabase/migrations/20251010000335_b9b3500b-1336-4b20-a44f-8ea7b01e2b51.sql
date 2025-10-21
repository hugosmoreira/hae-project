-- Create app_role enum if not exists
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create profiles table if not exists
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'Professional',
  region TEXT NOT NULL DEFAULT 'Oregon',
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create user_roles table for security if not exists
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Create channels table if not exists
CREATE TABLE IF NOT EXISTS public.channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  member_count INTEGER NOT NULL DEFAULT 0,
  is_public BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create messages table if not exists
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID NOT NULL REFERENCES public.channels(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  edited_at TIMESTAMPTZ
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "User roles are viewable by the user themselves" ON public.user_roles;
DROP POLICY IF EXISTS "Only admins can manage user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Public channels are viewable by everyone" ON public.channels;
DROP POLICY IF EXISTS "Authenticated users can create channels" ON public.channels;
DROP POLICY IF EXISTS "Admins can update channels" ON public.channels;
DROP POLICY IF EXISTS "Messages are viewable by authenticated users" ON public.messages;
DROP POLICY IF EXISTS "Authenticated users can create messages" ON public.messages;
DROP POLICY IF EXISTS "Users can update their own messages" ON public.messages;
DROP POLICY IF EXISTS "Users can delete their own messages" ON public.messages;

-- Create security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- RLS Policies for profiles
CREATE POLICY "Profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- RLS Policies for user_roles
CREATE POLICY "User roles are viewable by the user themselves"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Only admins can manage user roles"
  ON public.user_roles FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for channels
CREATE POLICY "Public channels are viewable by everyone"
  ON public.channels FOR SELECT
  USING (is_public = true OR auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can create channels"
  ON public.channels FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can update channels"
  ON public.channels FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for messages
CREATE POLICY "Messages are viewable by authenticated users"
  ON public.messages FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can create messages"
  ON public.messages FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own messages"
  ON public.messages FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own messages"
  ON public.messages FOR DELETE
  USING (auth.uid() = user_id);

-- Drop existing trigger and function if they exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create function to handle new user signup
CREATE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, username, role, region)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'Professional'),
    COALESCE(NEW.raw_user_meta_data->>'region', 'Oregon')
  );
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$;

-- Create trigger for new user signups
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Drop existing triggers for timestamps
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
DROP TRIGGER IF EXISTS update_channels_updated_at ON public.channels;

-- Create update timestamp function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_channels_updated_at
  BEFORE UPDATE ON public.channels
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default channels if they don't exist
INSERT INTO public.channels (name, description, category, member_count, is_public)
SELECT * FROM (VALUES
  ('general', 'General discussion and announcements', 'general', 156, true),
  ('introductions', 'Introduce yourself to the community', 'general', 89, true),
  ('help', 'Get help from the community', 'general', 234, true),
  ('inspections-general', 'General inspection discussions', 'inspections', 87, true),
  ('upcs-standards', 'UPCS standards and guidelines', 'inspections', 45, true),
  ('inspection-software', 'Software and tools for inspections', 'inspections', 62, true),
  ('hcv-program', 'Housing Choice Voucher program', 'hcv', 112, true),
  ('landlord-relations', 'Working with landlords', 'hcv', 78, true),
  ('tenant-services', 'Tenant support and services', 'hcv', 95, true),
  ('hud-compliance', 'HUD compliance requirements', 'compliance', 134, true),
  ('fair-housing', 'Fair housing regulations', 'compliance', 98, true),
  ('reporting', 'Reporting requirements and deadlines', 'compliance', 76, true),
  ('it-systems', 'IT systems and infrastructure', 'it', 54, true),
  ('software-updates', 'Software updates and releases', 'it', 43, true),
  ('data-security', 'Data security and privacy', 'it', 67, true),
  ('budget-planning', 'Budget planning and forecasting', 'finance', 89, true),
  ('grants', 'Grant opportunities and applications', 'finance', 72, true),
  ('capital-improvements', 'Capital improvement projects', 'finance', 56, true)
) AS v(name, description, category, member_count, is_public)
WHERE NOT EXISTS (
  SELECT 1 FROM public.channels WHERE channels.name = v.name
);

-- Enable realtime for messages and channels
DO $$
BEGIN
  PERFORM 1 FROM pg_publication_tables 
  WHERE pubname = 'supabase_realtime' AND tablename = 'messages';
  
  IF NOT FOUND THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
  END IF;
END $$;

DO $$
BEGIN
  PERFORM 1 FROM pg_publication_tables 
  WHERE pubname = 'supabase_realtime' AND tablename = 'channels';
  
  IF NOT FOUND THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.channels;
  END IF;
END $$;