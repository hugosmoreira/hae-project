-- ================================================
-- REACTIONS SYSTEM SETUP
-- ================================================
-- Run this SQL in your Supabase SQL Editor
-- ================================================

-- 1. Create reactions table
CREATE TABLE IF NOT EXISTS public.reactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  message_id UUID REFERENCES public.messages(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  emoji TEXT DEFAULT '👍',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure unique reaction per user per message
  UNIQUE(message_id, user_id, emoji)
);

-- 2. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_reactions_message_id ON public.reactions(message_id);
CREATE INDEX IF NOT EXISTS idx_reactions_user_id ON public.reactions(user_id);

-- 3. Enable Row Level Security
ALTER TABLE public.reactions ENABLE ROW LEVEL SECURITY;

-- 4. Drop existing policies if they exist (for re-running this script)
DROP POLICY IF EXISTS "Users can insert their own reactions" ON public.reactions;
DROP POLICY IF EXISTS "Users can select reactions" ON public.reactions;
DROP POLICY IF EXISTS "Users can delete their own reactions" ON public.reactions;

-- 5. Create RLS Policies
CREATE POLICY "Users can insert their own reactions"
ON public.reactions FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can select reactions"
ON public.reactions FOR SELECT
USING (true);

CREATE POLICY "Users can delete their own reactions"
ON public.reactions FOR DELETE
USING (auth.uid() = user_id);

-- 6. Enable Realtime for reactions table
ALTER PUBLICATION supabase_realtime ADD TABLE public.reactions;

-- ================================================
-- VERIFICATION QUERIES
-- ================================================
-- Run these to verify the setup:

-- Check if table exists
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name = 'reactions';

-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'reactions';

-- Check if realtime is enabled
SELECT tablename FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime' AND tablename = 'reactions';




