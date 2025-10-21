-- Create messages table for real-time chat functionality
CREATE TABLE IF NOT EXISTS messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    channel_id TEXT NOT NULL,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for efficient querying by channel
CREATE INDEX IF NOT EXISTS idx_messages_channel_id ON messages(channel_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);

-- Create index for user queries
CREATE INDEX IF NOT EXISTS idx_messages_user_id ON messages(user_id);

-- Enable Row Level Security
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can view messages in channels they have access to
CREATE POLICY "Users can view messages in accessible channels" ON messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM channels 
            WHERE channels.id = messages.channel_id 
            AND channels.is_public = true
        )
        OR 
        EXISTS (
            SELECT 1 FROM user_roles ur
            WHERE ur.user_id = auth.uid()
            AND ur.role IN ('admin', 'moderator')
        )
    );

-- Users can insert messages in channels they have access to
CREATE POLICY "Users can insert messages in accessible channels" ON messages
    FOR INSERT WITH CHECK (
        auth.uid() = user_id
        AND (
            EXISTS (
                SELECT 1 FROM channels 
                WHERE channels.id = messages.channel_id 
                AND channels.is_public = true
            )
            OR 
            EXISTS (
                SELECT 1 FROM user_roles ur
                WHERE ur.user_id = auth.uid()
                AND ur.role IN ('admin', 'moderator')
            )
        )
    );

-- Users can update their own messages
CREATE POLICY "Users can update their own messages" ON messages
    FOR UPDATE USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Users can delete their own messages
CREATE POLICY "Users can delete their own messages" ON messages
    FOR DELETE USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_messages_updated_at 
    BEFORE UPDATE ON messages 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Enable realtime for messages table
ALTER PUBLICATION supabase_realtime ADD TABLE messages;

-- Insert some sample channels if they don't exist
INSERT INTO channels (id, name, description, is_public) 
VALUES 
    ('general', 'General Discussion', 'General housing authority discussions', true),
    ('compliance', 'Compliance & Regulations', 'Discussion about compliance and regulatory matters', true),
    ('finance', 'Finance & Budgeting', 'Financial planning and budgeting discussions', true),
    ('maintenance', 'Maintenance & Operations', 'Property maintenance and operations', true),
    ('programs', 'Programs & Services', 'Housing programs and resident services', true)
ON CONFLICT (id) DO NOTHING;

-- Insert some sample messages
INSERT INTO messages (channel_id, user_id, content) 
SELECT 
    'general',
    p.id,
    'Welcome to the Housing Authority Exchange! This is a great place to share knowledge and learn from other professionals.'
FROM profiles p 
WHERE p.role = 'Professional' 
LIMIT 3
ON CONFLICT DO NOTHING;
