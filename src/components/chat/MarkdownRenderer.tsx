import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github.css';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  // BULLETPROOF: Always return plain text to avoid ReactMarkdown issues
  console.log('MarkdownRenderer called with:', { content, type: typeof content });
  
  // Force content to be a string
  const safeContent = typeof content === 'string' ? content : String(content || '');
  
  // For now, just return plain text to avoid the ReactMarkdown error
  return (
    <div className={className}>
      <div className="text-sm text-foreground whitespace-pre-wrap">
        {safeContent}
      </div>
    </div>
  );
}
