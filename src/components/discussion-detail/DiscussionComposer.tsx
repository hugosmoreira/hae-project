import React from 'react';
import { Bold, Italic, List, Link, Paperclip, Eye, Send } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';

interface DiscussionComposerProps {
  discussionId: number;
}

export function DiscussionComposer({ discussionId }: DiscussionComposerProps) {
  const [content, setContent] = React.useState('');
  const [isPreview, setIsPreview] = React.useState(false);
  const [complianceConfirmed, setComplianceConfirmed] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async () => {
    if (!complianceConfirmed || !content.trim()) return;
    
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setContent('');
      setComplianceConfirmed(false);
      // Would show success toast in real app
    }, 1000);
  };

  const insertMarkdown = (syntax: string, placeholder: string = '') => {
    const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    const textToInsert = selectedText || placeholder;
    
    let newText = '';
    switch (syntax) {
      case 'bold':
        newText = `**${textToInsert}**`;
        break;
      case 'italic':
        newText = `*${textToInsert}*`;
        break;
      case 'list':
        newText = `\n- ${textToInsert}`;
        break;
      case 'link':
        newText = `[${textToInsert || 'link text'}](url)`;
        break;
      default:
        newText = textToInsert;
    }

    const newContent = content.substring(0, start) + newText + content.substring(end);
    setContent(newContent);
    
    // Focus back to textarea
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + newText.length, start + newText.length);
    }, 0);
  };

  const handleMention = (text: string) => {
    const atIndex = text.lastIndexOf('@');
    if (atIndex === -1) return;
    
    const searchTerm = text.substring(atIndex + 1).toLowerCase();
    // In real app, would show mention suggestions based on searchTerm
  };

  const renderPreview = (text: string) => {
    // Simple markdown preview
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n- (.*)/g, '<br>• $1')
      .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="text-civic-blue hover:underline">$1</a>')
      .split('\n').map(line => `<p>${line}</p>`).join('');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send className="h-5 w-5 text-civic-blue" />
          Reply to Discussion
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Toolbar */}
        <div className="flex items-center gap-1 p-2 bg-muted/50 rounded-md">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => insertMarkdown('bold', 'bold text')}
            aria-label="Bold"
          >
            <Bold className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => insertMarkdown('italic', 'italic text')}
            aria-label="Italic"
          >
            <Italic className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => insertMarkdown('list', 'list item')}
            aria-label="Bullet list"
          >
            <List className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => insertMarkdown('link')}
            aria-label="Insert link"
          >
            <Link className="h-4 w-4" />
          </Button>
          
          <Separator orientation="vertical" className="h-6 mx-2" />
          
          <Button
            variant="ghost"
            size="sm"
            aria-label="Attach file"
          >
            <Paperclip className="h-4 w-4" />
          </Button>
          
          <div className="ml-auto">
            <Button
              variant={isPreview ? "default" : "ghost"}
              size="sm"
              onClick={() => setIsPreview(!isPreview)}
              className="gap-2"
            >
              <Eye className="h-4 w-4" />
              Preview
            </Button>
          </div>
        </div>

        {/* Content Area */}
        {isPreview ? (
          <div className="min-h-[200px] p-4 border border-border rounded-md bg-background">
            {content ? (
              <div 
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: renderPreview(content) }}
              />
            ) : (
              <p className="text-muted-foreground italic">Nothing to preview yet...</p>
            )}
          </div>
        ) : (
          <Textarea
            placeholder="Share your thoughts, experiences, or questions... Use @username to mention someone or @role/region for broader mentions."
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              handleMention(e.target.value);
            }}
            className="min-h-[200px] resize-none"
            aria-label="Reply content"
          />
        )}

        {/* Compliance Checkbox */}
        <div className="flex items-start space-x-2 p-4 bg-amber-50 border border-amber-200 rounded-md">
          <Checkbox
            id="compliance"
            checked={complianceConfirmed}
            onCheckedChange={(checked) => setComplianceConfirmed(checked === true)}
            aria-describedby="compliance-description"
          />
          <div className="text-sm">
            <label htmlFor="compliance" className="font-medium text-amber-800 cursor-pointer">
              Compliance Confirmation
            </label>
            <p id="compliance-description" className="text-amber-700">
              I confirm this reply contains no proprietary content, sensitive data, or screenshots 
              that could violate Housing Authority policies or resident privacy.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-2">
          <div className="text-sm text-muted-foreground">
            Tip: Use ** for <strong>bold</strong>, * for <em>italic</em>, and @ to mention users
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              disabled={!content.trim()}
              onClick={() => setIsPreview(!isPreview)}
            >
              {isPreview ? 'Edit' : 'Preview'}
            </Button>
            
            <Button
              onClick={handleSubmit}
              disabled={!complianceConfirmed || !content.trim() || isSubmitting}
              className="gap-2"
            >
              <Send className="h-4 w-4" />
              {isSubmitting ? 'Posting...' : 'Post Reply'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}