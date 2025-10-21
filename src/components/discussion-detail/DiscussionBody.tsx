import React from 'react';
import { Download, FileText } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface DiscussionBodyProps {
  discussion: {
    content: string;
    attachments?: Array<{
      name: string;
      size: string;
    }>;
  };
}

export function DiscussionBody({ discussion }: DiscussionBodyProps) {
  // Simple markdown-like rendering for demo
  const renderContent = (content: string) => {
    // Split content by double newlines for paragraphs
    const paragraphs = content.split('\n\n');
    
    return paragraphs.map((paragraph, index) => {
      // Check if it's a numbered list
      if (paragraph.includes('1.') || paragraph.includes('2.') || paragraph.includes('3.')) {
        const lines = paragraph.split('\n');
        return (
          <div key={index} className="space-y-2 mb-4">
            {lines.map((line, lineIndex) => {
              if (line.match(/^\d+\./)) {
                // Extract bold text
                const boldMatch = line.match(/\*\*(.*?)\*\*/);
                if (boldMatch) {
                  const beforeBold = line.substring(0, line.indexOf('**'));
                  const boldText = boldMatch[1];
                  const afterBold = line.substring(line.indexOf('**') + boldMatch[0].length);
                  
                  return (
                    <div key={lineIndex} className="flex gap-3">
                      <span className="text-civic-blue font-medium">{beforeBold}</span>
                      <div>
                        <span className="font-semibold">{boldText}</span>
                        <span>{afterBold}</span>
                      </div>
                    </div>
                  );
                }
                return <div key={lineIndex} className="text-muted-foreground">{line}</div>;
              }
              return <div key={lineIndex} className="text-muted-foreground ml-6">{line}</div>;
            })}
          </div>
        );
      }
      
      // Regular paragraph
      return (
        <p key={index} className="text-foreground mb-4 leading-relaxed">
          {paragraph}
        </p>
      );
    });
  };

  return (
    <Card className="border-l-4 border-l-civic-blue/50">
      <CardContent className="p-6">
        <div className="prose prose-civic max-w-none">
          {renderContent(discussion.content)}
        </div>

        {/* Attachments */}
        {discussion.attachments && discussion.attachments.length > 0 && (
          <div className="mt-6 pt-6 border-t border-border">
            <h4 className="text-sm font-medium text-muted-foreground mb-3">Attachments</h4>
            <div className="flex flex-wrap gap-2">
              {discussion.attachments.map((attachment, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="gap-2 h-auto p-3 justify-start"
                  aria-label={`Download ${attachment.name}`}
                >
                  <FileText className="h-4 w-4 text-civic-blue" />
                  <div className="text-left">
                    <div className="font-medium text-sm">{attachment.name}</div>
                    <div className="text-xs text-muted-foreground">{attachment.size}</div>
                  </div>
                  <Download className="h-3 w-3 ml-auto text-muted-foreground" />
                </Button>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}