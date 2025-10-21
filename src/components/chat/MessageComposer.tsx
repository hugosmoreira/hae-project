import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Paperclip, 
  Smile,
  AtSign
} from 'lucide-react';
import { useMessages } from '@/hooks/useMessages';
import { useTypingIndicator } from '@/hooks/useTypingIndicator';
import { MessageInput } from './MessageInput';
import { useToast } from '@/hooks/use-toast';

interface MessageComposerProps {
  channelId: string;
}

export function MessageComposer({ channelId }: MessageComposerProps) {
  const { sendMessage, isSending } = useMessages(channelId);
  const { typingUsers, startTyping, stopTyping } = useTypingIndicator(channelId);
  const { toast } = useToast();

  const handleSendMessage = async (message: string) => {
    try {
      await sendMessage(message);
      stopTyping(); // Stop typing when message is sent
    } catch (error) {
      toast({
        title: "Failed to send message",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleAttachment = () => {
    // TODO: Implement file attachment
    toast({
      title: "Coming soon",
      description: "File attachments will be available soon.",
    });
  };

  const handleMention = () => {
    // TODO: Implement @mention functionality
    const cursorPosition = textareaRef.current?.selectionStart || 0;
    const textBefore = message.substring(0, cursorPosition);
    const textAfter = message.substring(cursorPosition);
    setMessage(textBefore + '@' + textAfter);
    
    // Focus and set cursor position
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(cursorPosition + 1, cursorPosition + 1);
      }
    }, 0);
  };

  const handleEmoji = () => {
    // TODO: Implement emoji picker
    toast({
      title: "Coming soon",
      description: "Emoji picker will be available soon.",
    });
  };

  return (
    <div className="p-4">
      {/* Typing indicator */}
      <div className="h-4 mb-2">
        {typingUsers.length > 0 && (
          <p className="text-xs text-muted-foreground">
            {typingUsers.length === 1 
              ? `${typingUsers[0].username} is typing...`
              : `${typingUsers.length} people are typing...`
            }
          </p>
        )}
      </div>

      <div className="border border-border rounded-lg bg-background p-4">
        <div className="flex flex-col gap-3">
          {/* Main input area */}
          <MessageInput
            onSendMessage={handleSendMessage}
            disabled={isSending}
            placeholder="Type your message... (Enter to send, Shift+Enter for new line)"
            maxLength={2000}
            onTypingStart={startTyping}
            onTypingStop={stopTyping}
          />

          {/* Actions bar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleAttachment}
                className="h-8 w-8 p-0"
                title="Attach file"
                disabled={isSending}
              >
                <Paperclip className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMention}
                className="h-8 w-8 p-0"
                title="Mention someone"
                disabled={isSending}
              >
                <AtSign className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleEmoji}
                className="h-8 w-8 p-0"
                title="Add emoji"
                disabled={isSending}
              >
                <Smile className="h-4 w-4" />
              </Button>
            </div>

            <div className="text-xs text-muted-foreground">
              <kbd className="px-1 py-0.5 text-xs bg-muted rounded">Ctrl+K</kbd> to switch channels
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}