import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ChannelHeader } from './ChannelHeader';
import { MessageList } from './MessageList';
import { MessageComposer } from './MessageComposer';
import { ThreadView } from './ThreadView';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Hash, Info } from 'lucide-react';
import { useMessages, type Message } from '@/hooks/useMessages';

interface MessagePaneProps {
  channelId: string | null;
  userRole: string;
  onToggleMobileChannelList: () => void;
  isMobileChannelListOpen: boolean;
}

interface Channel {
  id: string;
  name: string;
  description: string | null;
  category: string;
  member_count: number;
  is_public: boolean;
}

export function MessagePane({ 
  channelId, 
  userRole, 
  onToggleMobileChannelList, 
  isMobileChannelListOpen 
}: MessagePaneProps) {
  const [channel, setChannel] = useState<Channel | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeThreadMessageId, setActiveThreadMessageId] = useState<string | null>(null);
  const [activeThreadMessage, setActiveThreadMessage] = useState<Message | null>(null);
  
  // Get messages for finding thread message details
  const { messages } = useMessages(channelId);

  useEffect(() => {
    if (channelId) {
      fetchChannel();
      // Close thread view when changing channels
      setActiveThreadMessageId(null);
      setActiveThreadMessage(null);
    } else {
      setChannel(null);
    }
  }, [channelId]);
  
  // Update active thread message when messages change or thread is opened
  useEffect(() => {
    if (activeThreadMessageId && messages.length > 0) {
      const message = messages.find(m => m.id === activeThreadMessageId);
      if (message) {
        setActiveThreadMessage(message);
      }
    }
  }, [activeThreadMessageId, messages]);
  
  const handleReplyClick = (messageId: string) => {
    setActiveThreadMessageId(messageId);
  };
  
  const handleCloseThread = () => {
    setActiveThreadMessageId(null);
    setActiveThreadMessage(null);
  };

  const fetchChannel = async () => {
    if (!channelId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('channels')
        .select('*')
        .eq('id', channelId)
        .single();

      if (error) throw error;
      setChannel(data);
    } catch (error) {
      console.error('Error fetching channel:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!channelId) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <div className="text-center space-y-4 max-w-md">
          <Hash className="h-16 w-16 text-muted-foreground mx-auto" />
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-foreground">
              Welcome to Housing Authority Chat
            </h3>
            <p className="text-muted-foreground">
              Select a channel from the sidebar to start participating in discussions with your team.
            </p>
          </div>
          <button
            onClick={onToggleMobileChannelList}
            className="md:hidden bg-primary text-primary-foreground px-4 py-2 rounded-lg"
          >
            Browse Channels
          </button>
        </div>
      </div>
    );
  }

  if (loading || !channel) {
    return (
      <div className="flex-1 flex flex-col">
        <div className="h-16 border-b border-border bg-card flex items-center px-4">
          <div className="h-6 w-32 bg-muted rounded animate-pulse" />
        </div>
        <div className="flex-1 p-4 space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex gap-3">
              <div className="h-8 w-8 bg-muted rounded-full animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-24 bg-muted rounded animate-pulse" />
                <div className="h-4 w-full bg-muted rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex h-full">
      {/* Main message area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Channel Header */}
        <ChannelHeader 
          channel={channel}
          userRole={userRole}
          onToggleMobileChannelList={onToggleMobileChannelList}
          isMobileChannelListOpen={isMobileChannelListOpen}
        />

        {/* Data Sharing Warning Banner */}
        <Alert className="m-4 mb-0 border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30">
          <Info className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          <AlertDescription className="text-amber-800 dark:text-amber-200">
            <strong>Data Sharing Policy:</strong> Share processes and best practices freely. 
            Do not share proprietary screenshots, sensitive data, or confidential information.
          </AlertDescription>
        </Alert>

        {/* Message List */}
        <div className="flex-1 overflow-hidden">
          <MessageList 
            channelId={channelId} 
            userRole={userRole} 
            onReplyClick={handleReplyClick}
          />
        </div>

        {/* Message Composer */}
        <div className="border-t border-border">
          <MessageComposer channelId={channelId} />
        </div>
      </div>
      
      {/* Thread View Side Panel */}
      {activeThreadMessageId && activeThreadMessage && (
        <div className="w-96 border-l hidden lg:block">
          <ThreadView
            messageId={activeThreadMessageId}
            messageContent={activeThreadMessage.content}
            messageAuthor={activeThreadMessage.author}
            messageCreatedAt={activeThreadMessage.created_at}
            onClose={handleCloseThread}
          />
        </div>
      )}
    </div>
  );
}