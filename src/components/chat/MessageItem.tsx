import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow, format } from 'date-fns';
import { MessageSquare } from 'lucide-react';
import { MarkdownRenderer } from './MarkdownRenderer';
import { SafeMarkdownRenderer } from './SafeMarkdownRenderer';
import { EmojiReactionPicker } from './EmojiReactionPicker';
import { useReactions } from '@/hooks/useReactions';
import { useThreadCount } from '@/hooks/useThreads';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  content: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  author?: {
    username: string;
    role: string;
    region: string;
  };
  isOptimistic?: boolean;
}

interface MessageItemProps {
  message: Message;
  showAvatar: boolean;
  showHeader: boolean;
  userRole: string;
  isLastInGroup?: boolean;
  isFirstInGroup?: boolean;
  onReplyClick?: (messageId: string) => void;
}

export function MessageItem({ 
  message, 
  showAvatar, 
  showHeader, 
  userRole, 
  isLastInGroup = false, 
  isFirstInGroup = false,
  onReplyClick 
}: MessageItemProps) {
  // Get current user
  const [currentUserId, setCurrentUserId] = React.useState<string | undefined>();
  
  React.useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setCurrentUserId(user?.id);
    });
  }, []);

  // Use reactions hook
  const { reactionCounts, toggleReaction, isToggling } = useReactions(message.id, currentUserId);
  
  // Get thread count for this message
  const threadCount = useThreadCount(message.id);

  const getInitials = (username: string) => {
    return username.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role.toLowerCase()) {
      case 'administrator':
        return 'destructive';
      case 'moderator':
        return 'default';
      default:
        return 'secondary';
    }
  };

  const getTimeDisplay = () => {
    const messageTime = new Date(message.created_at);
    const now = new Date();
    const diffInHours = (now.getTime() - messageTime.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return formatDistanceToNow(messageTime, { addSuffix: true });
    } else {
      return format(messageTime, 'MMM d, h:mm a');
    }
  };

  return (
    <div className={cn(
      "group",
      showHeader ? 'mt-4' : 'mt-1',
      isFirstInGroup && 'mt-2',
      isLastInGroup && 'mb-2'
    )}>
      <div className="flex gap-3">
        {/* Avatar column */}
        <div className="w-8 flex-shrink-0">
          {showAvatar && (
            <Avatar className="h-8 w-8 ring-2 ring-background">
              <AvatarImage 
                src={message.author?.avatar_url} 
                alt={message.author?.username || 'User'} 
              />
              <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                {getInitials(message.author?.username || 'U')}
              </AvatarFallback>
            </Avatar>
          )}
        </div>

        {/* Message content */}
        <div className="flex-1 min-w-0">
          {/* User header */}
          {showHeader && (
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium text-sm text-foreground">
                {message.author?.username || 'Unknown User'}
              </span>
              <Badge 
                variant={getRoleBadgeVariant(message.author?.role || '')}
                className="text-xs h-5"
              >
                {message.author?.role || 'User'}
              </Badge>
              <Badge variant="outline" className="text-xs h-5">
                {message.author?.region || 'Unknown'}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {getTimeDisplay()}
              </span>
              {message.isOptimistic && (
                <span className="text-xs text-muted-foreground">(sending...)</span>
              )}
            </div>
          )}
          
          {/* Message text */}
          <div className={cn(
            "text-sm leading-relaxed",
            showHeader ? "text-foreground" : "text-foreground/90"
          )}>
            {(() => {
              const content = typeof message.content === 'string' ? message.content : String(message.content || '');
              try {
                return <MarkdownRenderer content={content} />;
              } catch (error) {
                console.error('Error rendering markdown, falling back to safe renderer:', error);
                return <SafeMarkdownRenderer content={content} />;
              }
            })()}
          </div>

          {/* Reactions and Thread Actions */}
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            {/* Display existing reactions */}
            {reactionCounts.map((reaction) => (
              <Button
                key={reaction.emoji}
                variant={reaction.userReacted ? "default" : "outline"}
                size="sm"
                className={cn(
                  "h-7 px-2 text-xs gap-1",
                  reaction.userReacted && "bg-primary/10 hover:bg-primary/20 text-primary border-primary"
                )}
                onClick={() => toggleReaction(reaction.emoji)}
                disabled={isToggling}
              >
                <span className="text-base leading-none">{reaction.emoji}</span>
                <span className="font-medium">{reaction.count}</span>
              </Button>
            ))}

            {/* Emoji reaction picker */}
            {currentUserId && (
              <EmojiReactionPicker
                onEmojiSelect={toggleReaction}
                disabled={isToggling}
              />
            )}
            
            {/* Thread/Reply button */}
            {onReplyClick && (
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "h-7 px-2 text-xs gap-1",
                  threadCount > 0 ? "opacity-100" : "opacity-0 group-hover:opacity-100",
                  "transition-opacity"
                )}
                onClick={() => onReplyClick(message.id)}
                title="View or add replies"
              >
                <MessageSquare className="h-3 w-3" />
                {threadCount > 0 && (
                  <span className="font-medium">{threadCount}</span>
                )}
                {threadCount === 0 && (
                  <span className="text-xs">Reply</span>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}