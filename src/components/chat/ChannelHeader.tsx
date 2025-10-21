import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Hash, 
  Users, 
  Menu,
  UserPlus,
  UserMinus,
  Settings
} from 'lucide-react';

interface Channel {
  id: string;
  name: string;
  description: string | null;
  category: string;
  member_count: number;
  is_public: boolean;
}

interface ChannelHeaderProps {
  channel: Channel;
  userRole: string;
  onToggleMobileChannelList: () => void;
  isMobileChannelListOpen: boolean;
}

export function ChannelHeader({ 
  channel, 
  userRole, 
  onToggleMobileChannelList, 
  isMobileChannelListOpen 
}: ChannelHeaderProps) {
  const [isJoined, setIsJoined] = useState(true); // TODO: Get from actual membership status

  const handleJoinLeave = () => {
    // TODO: Implement join/leave channel functionality
    setIsJoined(!isJoined);
  };

  const handleChannelSettings = () => {
    // TODO: Implement channel settings modal
    console.log('Open channel settings');
  };

  return (
    <div className="h-16 border-b border-border bg-card flex items-center justify-between px-4">
      <div className="flex items-center gap-3">
        {/* Mobile menu button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleMobileChannelList}
          className="md:hidden"
        >
          <Menu className="h-4 w-4" />
        </Button>

        {/* Channel info */}
        <div className="flex items-center gap-3">
          <Hash className="h-5 w-5 text-muted-foreground" />
          <div>
            <h1 className="font-semibold text-foreground">{channel.name}</h1>
            {channel.description && (
              <p className="text-xs text-muted-foreground">{channel.description}</p>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Member count */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="h-4 w-4" />
          <span>{channel.member_count}</span>
        </div>

        {/* Channel status */}
        <Badge variant="secondary" className="text-xs">
          {channel.is_public ? 'Public' : 'Private'}
        </Badge>

        {/* Join/Leave button */}
        <Button
          variant={isJoined ? "outline" : "civic"}
          size="sm"
          onClick={handleJoinLeave}
          className="hidden sm:flex"
        >
          {isJoined ? (
            <>
              <UserMinus className="h-4 w-4 mr-2" />
              Leave
            </>
          ) : (
            <>
              <UserPlus className="h-4 w-4 mr-2" />
              Join
            </>
          )}
        </Button>

        {/* Settings for moderators/admins */}
        {(userRole === 'Moderator' || userRole === 'Administrator') && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleChannelSettings}
            className="hidden sm:flex"
          >
            <Settings className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}