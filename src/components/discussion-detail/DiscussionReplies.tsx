import React from 'react';
import { ThumbsUp, MessageCircle, MoreVertical } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatDistanceToNow } from 'date-fns';

interface Reply {
  id: number;
  content: string;
  author: string;
  role: string;
  region: string;
  timestamp: string;
  upvotes: number;
  reactions: Array<{ emoji: string; count: number }>;
  parentId: number | null;
  isMarkedHelpful: boolean;
}

interface DiscussionRepliesProps {
  replies: Reply[];
  discussionId: number;
  totalReplies: number;
}

export function DiscussionReplies({ replies, discussionId, totalReplies }: DiscussionRepliesProps) {
  const [sortBy, setSortBy] = React.useState('top');
  const [loadedReplies, setLoadedReplies] = React.useState(replies);
  const [isLoadingMore, setIsLoadingMore] = React.useState(false);

  const getInitials = (name: string) => {
    return name.split(' ').map(word => word.charAt(0)).join('').toUpperCase();
  };

  const handleLoadMore = () => {
    setIsLoadingMore(true);
    // Simulate loading more replies
    setTimeout(() => {
      setIsLoadingMore(false);
      // In real app, would load more from API
    }, 1000);
  };

  const handleReply = (parentId: number) => {
    // In real app, would show reply composer for this specific reply
    console.log('Reply to:', parentId);
  };

  const handleUpvote = (replyId: number) => {
    setLoadedReplies(prev => prev.map(reply => 
      reply.id === replyId 
        ? { ...reply, upvotes: reply.upvotes + 1 }
        : reply
    ));
  };

  // Group replies by parent
  const topLevelReplies = loadedReplies.filter(reply => reply.parentId === null);
  const childReplies = loadedReplies.filter(reply => reply.parentId !== null);

  const getRepliesForParent = (parentId: number) => {
    return childReplies.filter(reply => reply.parentId === parentId);
  };

  if (totalReplies === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="p-8 text-center">
          <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No replies yet</h3>
          <p className="text-muted-foreground mb-4">
            Be the first to share your thoughts on this discussion.
          </p>
          <Button className="gap-2">
            <MessageCircle className="h-4 w-4" />
            Write the first reply
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">
          Replies ({totalReplies})
        </h2>
        
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="top">Top</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="old">Old</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Replies List */}
      <div className="space-y-4">
        {topLevelReplies.map((reply) => (
          <div key={reply.id} className="space-y-3">
            {/* Parent Reply */}
            <Card className={`${reply.isMarkedHelpful ? 'border-l-4 border-l-green-500 bg-green-50/50' : ''}`}>
              <CardContent className="p-6">
                <div className="flex gap-4">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                      {getInitials(reply.author)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 space-y-3">
                    {/* Reply Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-medium text-foreground">{reply.author}</span>
                        <span className="text-muted-foreground">•</span>
                        <span className="text-muted-foreground">{reply.role}</span>
                        <span className="text-muted-foreground">•</span>
                        <span className="text-muted-foreground">{reply.region}</span>
                        <span className="text-muted-foreground">•</span>
                        <span className="text-muted-foreground">
                          {formatDistanceToNow(new Date(reply.timestamp), { addSuffix: true })}
                        </span>
                        {reply.isMarkedHelpful && (
                          <Badge className="bg-green-100 text-green-700 border-green-200 ml-2">
                            ✓ Helpful
                          </Badge>
                        )}
                      </div>
                      
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Reply Content */}
                    <p className="text-foreground leading-relaxed">{reply.content}</p>

                    {/* Reply Actions */}
                    <div className="flex items-center gap-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleUpvote(reply.id)}
                        className="gap-1 text-muted-foreground hover:text-civic-blue"
                      >
                        <ThumbsUp className="h-4 w-4" />
                        {reply.upvotes}
                      </Button>

                      {reply.reactions.map((reaction, index) => (
                        <Button
                          key={index}
                          variant="ghost"
                          size="sm"
                          className="gap-1 text-muted-foreground hover:text-civic-blue"
                        >
                          {reaction.emoji} {reaction.count}
                        </Button>
                      ))}

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleReply(reply.id)}
                        className="gap-1 text-muted-foreground hover:text-civic-blue"
                      >
                        <MessageCircle className="h-4 w-4" />
                        Reply
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Child Replies */}
            {getRepliesForParent(reply.id).map((childReply) => (
              <div key={childReply.id} className="ml-12 relative">
                {/* Connector Line */}
                <div className="absolute -left-6 top-0 bottom-0 w-px bg-border"></div>
                <div className="absolute -left-8 top-6 w-4 h-px bg-border"></div>
                
                <Card className="bg-muted/30">
                  <CardContent className="p-4">
                    <div className="flex gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-muted text-xs">
                          {getInitials(childReply.author)}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <span className="font-medium text-foreground">{childReply.author}</span>
                          <span className="text-muted-foreground">•</span>
                          <span className="text-muted-foreground">{childReply.role}</span>
                          <span className="text-muted-foreground">•</span>
                          <span className="text-muted-foreground">
                            {formatDistanceToNow(new Date(childReply.timestamp), { addSuffix: true })}
                          </span>
                        </div>

                        <p className="text-foreground text-sm leading-relaxed">{childReply.content}</p>

                        <div className="flex items-center gap-3">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleUpvote(childReply.id)}
                            className="gap-1 text-muted-foreground hover:text-civic-blue text-xs h-7"
                          >
                            <ThumbsUp className="h-3 w-3" />
                            {childReply.upvotes}
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleReply(childReply.id)}
                            className="gap-1 text-muted-foreground hover:text-civic-blue text-xs h-7"
                          >
                            <MessageCircle className="h-3 w-3" />
                            Reply
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Load More Button */}
      {loadedReplies.length < totalReplies && (
        <div className="text-center">
          <Button
            variant="outline"
            onClick={handleLoadMore}
            disabled={isLoadingMore}
            className="gap-2"
          >
            {isLoadingMore ? 'Loading...' : `Load more replies (${totalReplies - loadedReplies.length} remaining)`}
          </Button>
        </div>
      )}
    </div>
  );
}