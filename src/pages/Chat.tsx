import React, { useState } from 'react';
import { ChannelList } from '@/components/chat/ChannelList';
import { MessagePane } from '@/components/chat/MessagePane';

interface ChatProps {
  userRole?: string;
}

export default function Chat({ userRole = 'Professional' }: ChatProps) {
  const [selectedChannelId, setSelectedChannelId] = useState<string | null>(null);
  const [isMobileChannelListOpen, setIsMobileChannelListOpen] = useState(false);

  const handleChannelSelect = (channelId: string) => {
    setSelectedChannelId(channelId);
    setIsMobileChannelListOpen(false); // Close mobile channel list when selecting
  };

  const handleToggleMobileChannelList = () => {
    setIsMobileChannelListOpen(!isMobileChannelListOpen);
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-background">
      {/* Channel List - Left Column */}
      <div className={`
        ${isMobileChannelListOpen ? 'block' : 'hidden'} 
        md:block 
        w-full md:w-80 
        border-r border-border 
        bg-card 
        relative z-10
      `}>
        <ChannelList 
          onChannelSelect={handleChannelSelect}
          selectedChannelId={selectedChannelId}
          userRole={userRole}
        />
      </div>

      {/* Message Pane - Right Column */}
      <div className="flex-1 flex flex-col">
        <MessagePane 
          channelId={selectedChannelId}
          userRole={userRole}
          onToggleMobileChannelList={handleToggleMobileChannelList}
          isMobileChannelListOpen={isMobileChannelListOpen}
        />
      </div>
    </div>
  );
}