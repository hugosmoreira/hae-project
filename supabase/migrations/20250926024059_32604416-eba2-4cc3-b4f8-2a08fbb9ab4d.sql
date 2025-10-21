-- Create channels table
CREATE TABLE public.channels (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'general', -- 'inspections', 'hcv', 'compliance', 'it', 'finance', 'general'
  is_public BOOLEAN NOT NULL DEFAULT true,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  member_count INTEGER NOT NULL DEFAULT 0,
  UNIQUE(name)
);

-- Create channel_members table
CREATE TABLE public.channel_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  channel_id UUID NOT NULL REFERENCES public.channels(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_read_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  role TEXT NOT NULL DEFAULT 'member', -- 'admin', 'moderator', 'member'
  UNIQUE(channel_id, user_id)
);

-- Create messages table
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  channel_id UUID NOT NULL REFERENCES public.channels(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  thread_id UUID REFERENCES public.messages(id),
  mentions JSONB DEFAULT '[]'::jsonb,
  attachments JSONB DEFAULT '[]'::jsonb,
  edited_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create message_reactions table
CREATE TABLE public.message_reactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id UUID NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  emoji TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(message_id, user_id, emoji)
);

-- Create message_reports table
CREATE TABLE public.message_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id UUID NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
  reported_by UUID NOT NULL,
  reason TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'reviewed', 'resolved'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID
);

-- Enable Row Level Security
ALTER TABLE public.channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.channel_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies for channels
CREATE POLICY "Public channels are viewable by everyone" 
ON public.channels 
FOR SELECT 
USING (is_public = true);

CREATE POLICY "Users can create channels" 
ON public.channels 
FOR INSERT 
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Channel creators can update their channels" 
ON public.channels 
FOR UPDATE 
USING (auth.uid() = created_by);

-- RLS Policies for channel_members
CREATE POLICY "Channel members can view membership" 
ON public.channel_members 
FOR SELECT 
USING (
  channel_id IN (
    SELECT id FROM public.channels WHERE is_public = true
  ) OR user_id = auth.uid()
);

CREATE POLICY "Users can join public channels" 
ON public.channel_members 
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id AND 
  channel_id IN (SELECT id FROM public.channels WHERE is_public = true)
);

CREATE POLICY "Users can leave channels" 
ON public.channel_members 
FOR DELETE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own membership" 
ON public.channel_members 
FOR UPDATE 
USING (auth.uid() = user_id);

-- RLS Policies for messages
CREATE POLICY "Messages are viewable by channel members" 
ON public.messages 
FOR SELECT 
USING (
  channel_id IN (
    SELECT channel_id FROM public.channel_members WHERE user_id = auth.uid()
  ) OR 
  channel_id IN (
    SELECT id FROM public.channels WHERE is_public = true
  )
);

CREATE POLICY "Channel members can create messages" 
ON public.messages 
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id AND
  (channel_id IN (
    SELECT channel_id FROM public.channel_members WHERE user_id = auth.uid()
  ) OR 
  channel_id IN (
    SELECT id FROM public.channels WHERE is_public = true
  ))
);

CREATE POLICY "Users can update their own messages" 
ON public.messages 
FOR UPDATE 
USING (auth.uid() = user_id);

-- RLS Policies for message_reactions
CREATE POLICY "Reactions are viewable with messages" 
ON public.message_reactions 
FOR SELECT 
USING (
  message_id IN (
    SELECT id FROM public.messages 
    WHERE channel_id IN (
      SELECT channel_id FROM public.channel_members WHERE user_id = auth.uid()
    ) OR 
    channel_id IN (
      SELECT id FROM public.channels WHERE is_public = true
    )
  )
);

CREATE POLICY "Users can react to messages" 
ON public.message_reactions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their own reactions" 
ON public.message_reactions 
FOR DELETE 
USING (auth.uid() = user_id);

-- RLS Policies for message_reports
CREATE POLICY "Users can view their own reports" 
ON public.message_reports 
FOR SELECT 
USING (auth.uid() = reported_by);

CREATE POLICY "Users can create reports" 
ON public.message_reports 
FOR INSERT 
WITH CHECK (auth.uid() = reported_by);

-- Create triggers for updated_at
CREATE TRIGGER update_channels_updated_at
  BEFORE UPDATE ON public.channels
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_messages_updated_at
  BEFORE UPDATE ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to update channel member count
CREATE OR REPLACE FUNCTION public.update_channel_member_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.channels 
    SET member_count = member_count + 1 
    WHERE id = NEW.channel_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.channels 
    SET member_count = member_count - 1 
    WHERE id = OLD.channel_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update member count
CREATE TRIGGER update_channel_member_count_trigger
  AFTER INSERT OR DELETE ON public.channel_members
  FOR EACH ROW
  EXECUTE FUNCTION public.update_channel_member_count();

-- Enable realtime for all chat tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.channels;
ALTER PUBLICATION supabase_realtime ADD TABLE public.channel_members;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.message_reactions;

-- Set replica identity for realtime updates
ALTER TABLE public.channels REPLICA IDENTITY FULL;
ALTER TABLE public.channel_members REPLICA IDENTITY FULL;
ALTER TABLE public.messages REPLICA IDENTITY FULL;
ALTER TABLE public.message_reactions REPLICA IDENTITY FULL;

-- Insert default channels
INSERT INTO public.channels (name, description, category, is_public, created_by) VALUES
('general', 'General discussion for all housing authority staff', 'general', true, '00000000-0000-0000-0000-000000000000'),
('inspections-general', 'Discussion about property inspections', 'inspections', true, '00000000-0000-0000-0000-000000000000'),
('hcv-updates', 'Housing Choice Voucher program updates', 'hcv', true, '00000000-0000-0000-0000-000000000000'),
('compliance-alerts', 'Compliance and regulatory discussions', 'compliance', true, '00000000-0000-0000-0000-000000000000'),
('it-support', 'Technical support and IT discussions', 'it', true, '00000000-0000-0000-0000-000000000000'),
('finance-updates', 'Financial reports and budget discussions', 'finance', true, '00000000-0000-0000-0000-000000000000');