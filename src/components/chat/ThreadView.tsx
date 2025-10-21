import React, { useState } from 'react';
import { X, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useThreads, type Thread } from '@/hooks/useThreads';
import { formatDistanceToNow, format } from 'date-fns';
import { cn } from '@/lib/utils';

interface ThreadViewProps {
  messageId: string;
  messageContent: string;
  messageAuthor?: {
    username: string;
    role: string;
    region: string;
  };
  messageCreatedAt: string;
  onClose: () => void;
}

export function ThreadView({
  messageId,
  messageContent,
  messageAuthor,
  messageCreatedAt,
  onClose,
}: ThreadViewProps) {
  const [replyText, setReplyText] = useState('');
  const { threads, isLoading, sendReply, isSending } = useThreads(messageId);

  const handleSendReply = () => {
    if (!replyText.trim()) return;
    sendReply(replyText);
    setReplyText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendReply();
    }
  };

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

  const getTimeDisplay = (createdAt: string) => {
    const time = new Date(createdAt);
    const now = new Date();
    const diffInHours = (now.getTime() - time.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return formatDistanceToNow(time, { addSuffix: true });
    } else {
      return format(time, 'MMM d, h:mm a');
    }
  };

  return (
    <div className="flex flex-col h-full bg-background border-l">
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between">
        <h3 className="font-semibold text-lg">Thread</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="h-8 w-8 p-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Original Message */}
      <div className="p-4 bg-muted/30">
        <div className="flex gap-3">
          <Avatar className="h-8 w-8 ring-2 ring-background">
            <AvatarImage
              src={messageAuthor?.avatar_url}
              alt={messageAuthor?.username || 'User'}
            />
            <AvatarFallback className="text-xs bg-primary text-primary-foreground">
              {getInitials(messageAuthor?.username || 'U')}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium text-sm">
                {messageAuthor?.username || 'Unknown User'}
              </span>
              <Badge
                variant={getRoleBadgeVariant(messageAuthor?.role || '')}
                className="text-xs h-5"
              >
                {messageAuthor?.role || 'User'}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {getTimeDisplay(messageCreatedAt)}
              </span>
            </div>
            <p className="text-sm text-foreground whitespace-pre-wrap">
              {messageContent}
            </p>
          </div>
        </div>
      </div>

      <Separator />

      {/* Replies */}
      <ScrollArea className="flex-1 p-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-sm text-muted-foreground">Loading replies...</p>
          </div>
        ) : threads.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-sm text-muted-foreground">
              No replies yet. Be the first to reply!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {threads.map((thread: Thread) => (
              <div key={thread.id} className="flex gap-3">
                <Avatar className="h-7 w-7 ring-2 ring-background">
                  <AvatarImage
                    src={thread.author?.avatar_url}
                    alt={thread.author?.username || 'User'}
                  />
                  <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                    {getInitials(thread.author?.username || 'U')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">
                      {thread.author?.username || 'Unknown User'}
                    </span>
                    <Badge
                      variant={getRoleBadgeVariant(thread.author?.role || '')}
                      className="text-xs h-4"
                    >
                      {thread.author?.role || 'User'}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {getTimeDisplay(thread.created_at)}
                    </span>
                  </div>
                  <p className="text-sm text-foreground whitespace-pre-wrap">
                    {thread.reply}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Reply Input */}
      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Reply to this thread... (Enter to send, Shift+Enter for new line)"
            className="min-h-[60px] max-h-[120px] resize-none"
            disabled={isSending}
          />
          <Button
            onClick={handleSendReply}
            disabled={!replyText.trim() || isSending}
            size="icon"
            className="flex-shrink-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          {replyText.length}/2000 characters
        </p>
      </div>
    </div>
  );
}




