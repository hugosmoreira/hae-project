import React from 'react';
import { ChevronRight, ThumbsUp, Eye, MessageCircle, UserPlus, Flag } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';

interface DiscussionHeaderProps {
  discussion: {
    id: number;
    title: string;
    author: string;
    role: string;
    region: string;
    timestamp: string;
    category: string;
    tags: string[];
    upvotes: number;
    isFollowing: boolean;
    views: number;
    replyCount: number;
    isMarkedHelpful: boolean;
  };
}

export function DiscussionHeader({ discussion }: DiscussionHeaderProps) {
  const [upvotes, setUpvotes] = React.useState(discussion.upvotes);
  const [isUpvoted, setIsUpvoted] = React.useState(false);
  const [isFollowing, setIsFollowing] = React.useState(discussion.isFollowing);

  const getInitials = (name: string) => {
    return name.split(' ').map(word => word.charAt(0)).join('').toUpperCase();
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      'HUD': 'bg-blue-100 text-blue-700 border-blue-200',
      'Compliance': 'bg-green-100 text-green-700 border-green-200',
      'Inspections': 'bg-orange-100 text-orange-700 border-orange-200',
      'Technology': 'bg-purple-100 text-purple-700 border-purple-200',
      'Finance': 'bg-emerald-100 text-emerald-700 border-emerald-200',
      'HR': 'bg-pink-100 text-pink-700 border-pink-200',
    };
    return colors[category] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const handleUpvote = () => {
    if (isUpvoted) {
      setUpvotes(prev => prev - 1);
    } else {
      setUpvotes(prev => prev + 1);
    }
    setIsUpvoted(!isUpvoted);
  };

  const handleFollow = () => {
    setIsFollowing(!isFollowing);
  };

  return (
    <div className="space-y-4">
      {/* Breadcrumbs */}
      <nav className="flex items-center space-x-2 text-sm text-muted-foreground">
        <a href="/discussions" className="hover:text-civic-blue transition-colors">
          Discussions
        </a>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground">{discussion.category}</span>
      </nav>

      {/* Title */}
      <div className="space-y-3">
        <div className="flex items-start gap-3">
          <h1 className="text-3xl font-bold text-foreground leading-tight flex-1">
            {discussion.title}
          </h1>
          {discussion.isMarkedHelpful && (
            <Badge className="bg-green-100 text-green-700 border-green-200 shrink-0">
              ✓ Marked as Helpful
            </Badge>
          )}
        </div>

        {/* Meta row */}
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-primary text-primary-foreground text-sm">
              {getInitials(discussion.author)}
            </AvatarFallback>
          </Avatar>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{discussion.author}</span>
            <span>•</span>
            <span>{discussion.role}</span>
            <span>•</span>
            <span>{discussion.region}</span>
            <span>•</span>
            <span>{formatDistanceToNow(new Date(discussion.timestamp), { addSuffix: true })}</span>
          </div>
        </div>

        {/* Badges */}
        <div className="flex items-center gap-2 flex-wrap">
          <Badge className={getCategoryColor(discussion.category)}>
            {discussion.category}
          </Badge>
          {discussion.tags.map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>

        {/* Actions and Stats Row */}
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              <span>{discussion.views} views</span>
            </div>
            <div className="flex items-center gap-1">
              <MessageCircle className="h-4 w-4" />
              <span>{discussion.replyCount} replies</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant={isUpvoted ? "default" : "outline"}
              size="sm"
              onClick={handleUpvote}
              className="gap-1"
              aria-label={`Upvote discussion. Currently ${upvotes} upvotes`}
            >
              <ThumbsUp className="h-4 w-4" />
              {upvotes}
            </Button>

            <Button
              variant={isFollowing ? "default" : "outline"}
              size="sm"
              onClick={handleFollow}
              className="gap-1"
              aria-label={isFollowing ? "Unfollow discussion" : "Follow discussion"}
            >
              <UserPlus className="h-4 w-4" />
              {isFollowing ? 'Following' : 'Follow'}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="gap-1 text-muted-foreground hover:text-destructive"
              aria-label="Report discussion"
            >
              <Flag className="h-4 w-4" />
              Report
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}