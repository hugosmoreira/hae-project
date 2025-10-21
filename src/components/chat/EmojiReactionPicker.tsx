import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Smile } from 'lucide-react';

interface EmojiReactionPickerProps {
  onEmojiSelect: (emoji: string) => void;
  disabled?: boolean;
}

// Popular reaction emojis
const REACTION_EMOJIS = [
  '👍', '❤️', '🔥', '😂', '🙌', '👏', '🎉', '✨',
  '💯', '👀', '🤔', '😮', '😍', '🚀', '⭐', '💪',
];

export function EmojiReactionPicker({ onEmojiSelect, disabled = false }: EmojiReactionPickerProps) {
  const [open, setOpen] = useState(false);

  const handleEmojiClick = (emoji: string) => {
    onEmojiSelect(emoji);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
          disabled={disabled}
          title="Add reaction"
        >
          <Smile className="h-3 w-3" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-2" align="start">
        <div className="grid grid-cols-8 gap-1">
          {REACTION_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              onClick={() => handleEmojiClick(emoji)}
              className="flex items-center justify-center h-8 w-8 rounded hover:bg-accent transition-colors text-lg"
              type="button"
              title={`React with ${emoji}`}
            >
              {emoji}
            </button>
          ))}
        </div>
        <div className="mt-2 pt-2 border-t">
          <p className="text-xs text-muted-foreground text-center">
            Click an emoji to react
          </p>
        </div>
      </PopoverContent>
    </Popover>
  );
}




