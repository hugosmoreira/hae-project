import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function FloatingActionButton() {
  const handleNewPost = () => {
    console.log('New post clicked');
    // TODO: Implement new post functionality
  };

  return (
    <Button
      onClick={handleNewPost}
      className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-shadow z-50"
      variant="civic"
      size="icon"
      aria-label="Create new post"
    >
      <Plus className="h-6 w-6" />
    </Button>
  );
}