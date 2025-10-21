import React, { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MessageInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
  maxLength?: number;
  className?: string;
  onTypingStart?: () => void;
  onTypingStop?: () => void;
}

export function MessageInput({
  onSendMessage,
  disabled = false,
  placeholder = "Type your message...",
  maxLength = 2000,
  className,
  onTypingStart,
  onTypingStop
}: MessageInputProps) {
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea based on content
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      // Reset height to auto to get the correct scrollHeight
      textarea.style.height = 'auto';
      // Set height to scrollHeight, but cap it at 120px (about 5 lines)
      const newHeight = Math.min(textarea.scrollHeight, 120);
      textarea.style.height = `${newHeight}px`;
    }
  }, [message]);

  // Focus textarea when component mounts
  useEffect(() => {
    if (textareaRef.current && !disabled) {
      textareaRef.current.focus();
    }
  }, [disabled]);

  const handleSendMessage = async () => {
    const trimmedMessage = message.trim();
    if (!trimmedMessage || isSending || disabled) return;

    setIsSending(true);
    try {
      await onSendMessage(trimmedMessage);
      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter') {
      if (e.shiftKey) {
        // Shift+Enter: Allow new line (default behavior)
        return;
      } else {
        // Enter without Shift: Send message
        e.preventDefault();
        handleSendMessage();
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    
    // Enforce max length
    if (value.length <= maxLength) {
      setMessage(value);
      
      // Trigger typing indicator
      if (value.trim() && onTypingStart) {
        onTypingStart();
      } else if (!value.trim() && onTypingStop) {
        onTypingStop();
      }
    }
  };

  const isDisabled = disabled || isSending || !message.trim();
  const characterCount = message.length;
  const isNearLimit = characterCount > maxLength * 0.8;

  return (
    <div className={cn("w-full", className)}>
      <div className="relative">
        <Textarea
          ref={textareaRef}
          value={message}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled || isSending}
          maxLength={maxLength}
          className={cn(
            "min-h-[44px] max-h-[120px] resize-none pr-12",
            "border-border focus-visible:ring-2 focus-visible:ring-primary/20",
            "transition-all duration-200",
            isSending && "opacity-70",
            disabled && "opacity-50 cursor-not-allowed"
          )}
          rows={1}
        />
        
        {/* Send button */}
        <div className="absolute bottom-2 right-2">
          <Button
            onClick={handleSendMessage}
            disabled={isDisabled}
            size="sm"
            className={cn(
              "h-8 w-8 p-0 rounded-full",
              "transition-all duration-200",
              "hover:scale-105 active:scale-95",
              isDisabled && "opacity-50 cursor-not-allowed"
            )}
            aria-label="Send message"
          >
            {isSending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Character count and keyboard shortcuts */}
      <div className="flex items-center justify-between mt-2 px-1">
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className={cn(
            "transition-colors",
            isNearLimit && "text-amber-600",
            characterCount >= maxLength && "text-red-600"
          )}>
            {characterCount}/{maxLength}
          </span>
          
          <span className="hidden sm:inline">
            Press <kbd className="px-1 py-0.5 text-xs bg-muted rounded">Enter</kbd> to send
          </span>
          
          <span className="hidden sm:inline">
            <kbd className="px-1 py-0.5 text-xs bg-muted rounded">Shift+Enter</kbd> for new line
          </span>
        </div>

        {/* Send status indicator */}
        {isSending && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Loader2 className="h-3 w-3 animate-spin" />
            <span>Sending...</span>
          </div>
        )}
      </div>

      {/* Character limit warning */}
      {characterCount >= maxLength && (
        <div className="mt-1 text-xs text-red-600">
          Message is too long. Please shorten your message.
        </div>
      )}
    </div>
  );
}
