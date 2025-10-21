import React from 'react';

interface SafeMarkdownRendererProps {
  content: string;
  className?: string;
}

export function SafeMarkdownRenderer({ content, className }: SafeMarkdownRendererProps) {
  // Simple fallback that just renders plain text
  const safeContent = typeof content === 'string' ? content : String(content || '');
  
  return (
    <div className={className}>
      <div className="text-sm text-foreground whitespace-pre-wrap">
        {safeContent}
      </div>
    </div>
  );
}
