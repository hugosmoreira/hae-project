import React, { useState, useEffect, useRef } from 'react';
import { MessageItem } from './MessageItem';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';
import { useMessages, Message } from '@/hooks/useMessages';
import { cn } from '@/lib/utils';
import { isToday, isYesterday } from 'date-fns';

interface MessageListProps {
  channelId: string;
  userRole: string;
  onReplyClick?: (messageId: string) => void;
}

export function MessageList({ channelId, userRole, onReplyClick }: MessageListProps) {
  const { messages, isLoading } = useMessages(channelId);
  const [hasNewMessages, setHasNewMessages] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      if (isAtBottom) {
        setTimeout(() => scrollToBottom(), 100);
      } else {
        setHasNewMessages(true);
      }
    }
  }, [messages.length, isAtBottom]);

  // Auto-scroll to bottom on initial load
  useEffect(() => {
    if (messages.length > 0 && !isLoading) {
      setTimeout(() => scrollToBottom(), 100);
    }
  }, [messages.length, isLoading]);

  // Group messages by date sections: Today, Yesterday, Older
  const messagesByDate = React.useMemo(() => {
    const sections: Record<'Today' | 'Yesterday' | 'Older', Message[]> = {
      Today: [],
      Yesterday: [],
      Older: [],
    };

    messages.forEach((msg) => {
      const created = new Date(msg.created_at);
      if (isToday(created)) {
        sections.Today.push(msg);
      } else if (isYesterday(created)) {
        sections.Yesterday.push(msg);
      } else {
        sections.Older.push(msg);
      }
    });

    return sections;
  }, [messages]);

  // Within each date section, group consecutive messages by the same user
  const groupByUserRuns = (sectionMessages: Message[]) => {
    const groups: Array<{ user: string; messages: Message[] }> = [];
    sectionMessages.forEach((message, index) => {
      const prevMessage = index > 0 ? sectionMessages[index - 1] : null;

      const isFirstInGroup = !prevMessage || prevMessage.user_id !== message.user_id;
      const timeGap = prevMessage 
        ? new Date(message.created_at).getTime() - new Date(prevMessage.created_at).getTime() 
        : 0;
      const isNewGroup = timeGap > 5 * 60 * 1000; // 5 minutes

      if (isFirstInGroup || isNewGroup) {
        groups.push({ user: message.user_id, messages: [message] });
      } else {
        groups[groups.length - 1].messages.push(message);
      }
    });
    return groups;
  };

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
    setHasNewMessages(false);
  };

  const handleScrollToBottom = () => {
    scrollToBottom();
    setIsAtBottom(true);
  };

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const target = event.target as HTMLDivElement;
    const isNearBottom = target.scrollHeight - target.scrollTop - target.clientHeight < 100;
    setIsAtBottom(isNearBottom);
    
    if (isNearBottom) {
      setHasNewMessages(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 space-y-4">
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
    );
  }

  return (
    <div className="relative h-full">
      <ScrollArea 
        ref={scrollAreaRef}
        className="h-full"
        onScrollCapture={handleScroll}
      >
        <div className="p-4 space-y-3">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                No messages yet. Be the first to start the conversation!
              </p>
            </div>
          ) : (
            ['Today', 'Yesterday', 'Older'].map((label) => {
              const section = messagesByDate[label as 'Today' | 'Yesterday' | 'Older'];
              if (!section || section.length === 0) return null;

              const userRuns = groupByUserRuns(section);

              return (
                <div key={label} className="space-y-2">
                  {/* Date section header */}
                  <div className="sticky top-0 z-10 flex items-center justify-center">
                    <span className="px-3 py-1 text-xs font-medium text-muted-foreground bg-muted rounded-full">
                      {label}
                    </span>
                  </div>

                  {/* Grouped messages within the section */}
                  <div className="space-y-1">
                    {userRuns.map((group, groupIndex) => (
                      <div key={`${label}-group-${groupIndex}`} className="space-y-1">
                        {group.messages.map((message, messageIndex) => {
                          const isFirstInGroup = messageIndex === 0;
                          const isLastInGroup = messageIndex === group.messages.length - 1;
                          const showAvatar = isFirstInGroup;
                          const showHeader = isFirstInGroup;

                          return (
                            <MessageItem
                              key={message.id}
                              message={message}
                              showAvatar={showAvatar}
                              showHeader={showHeader}
                              userRole={userRole}
                              isFirstInGroup={isFirstInGroup}
                              isLastInGroup={isLastInGroup}
                              onReplyClick={onReplyClick}
                            />
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          )}
          
          {/* Auto-scroll target */}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Scroll to bottom button */}
      {hasNewMessages && !isAtBottom && (
        <div className="absolute bottom-4 right-4">
          <Button
            onClick={handleScrollToBottom}
            size="sm"
            className="rounded-full shadow-lg"
          >
            <ChevronDown className="h-4 w-4 mr-1" />
            New messages
          </Button>
        </div>
      )}
    </div>
  );
}