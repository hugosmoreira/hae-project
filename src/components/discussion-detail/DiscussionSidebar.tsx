import React from 'react';
import { Eye, EyeOff, Trash2, CheckCircle, FolderOpen, Users, Hash } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';

interface DiscussionSidebarProps {
  discussion: {
    id: number;
    category: string;
    tags: string[];
  };
  userRole: string;
}

// Mock data
const relatedDiscussions = [
  {
    id: 2,
    title: 'Best Practices for Virtual Inspections',
    category: 'Inspections',
    replies: 7
  },
  {
    id: 3,
    title: 'Updated UPCS Standards 2024',
    category: 'Inspections',
    replies: 15
  },
  {
    id: 4,
    title: 'HUD Training Resources',
    category: 'Inspections',
    replies: 23
  }
];

const topTags = [
  { name: 'HUD', count: 156 },
  { name: 'Inspections', count: 142 },
  { name: 'Section 8', count: 128 },
  { name: 'Compliance', count: 98 },
  { name: 'Training', count: 87 },
  { name: 'UPCS', count: 76 }
];

const followers = [
  { name: 'Mike Rodriguez', role: 'Property Management' },
  { name: 'Jennifer Walsh', role: 'Finance' },
  { name: 'David Kim', role: 'Voucher Specialist' },
  { name: 'Lisa Thompson', role: 'Compliance' },
  { name: 'Tom Wilson', role: 'Inspector' }
];

export function DiscussionSidebar({ discussion, userRole }: DiscussionSidebarProps) {
  const getInitials = (name: string) => {
    return name.split(' ').map(word => word.charAt(0)).join('').toUpperCase();
  };

  const isModerator = userRole === 'Moderator' || userRole === 'Admin';

  return (
    <div className="space-y-6">
      {/* Related Discussions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <FolderOpen className="h-5 w-5 text-civic-blue" />
            Related Discussions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {relatedDiscussions.map((related) => (
            <div key={related.id} className="group cursor-pointer">
              <h4 className="font-medium text-sm leading-tight group-hover:text-civic-blue transition-colors">
                {related.title}
              </h4>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-xs">
                  {related.category}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {related.replies} replies
                </span>
              </div>
            </div>
          ))}
          
          <Button variant="ghost" size="sm" className="w-full mt-3 text-civic-blue">
            View all in {discussion.category}
          </Button>
        </CardContent>
      </Card>

      {/* Top Tags */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Hash className="h-5 w-5 text-civic-blue" />
            Top Tags
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {topTags.map((tag) => (
              <Button
                key={tag.name}
                variant="outline"
                size="sm"
                className="h-auto px-3 py-1 text-xs hover:bg-civic-blue hover:text-white"
              >
                {tag.name}
                <span className="ml-1 text-muted-foreground">({tag.count})</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Followers */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="h-5 w-5 text-civic-blue" />
            Followers
            <Badge variant="secondary" className="ml-auto">
              {followers.length + 15}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {followers.slice(0, 3).map((follower) => (
              <div key={follower.name} className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-muted text-xs">
                    {getInitials(follower.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{follower.name}</p>
                  <p className="text-xs text-muted-foreground">{follower.role}</p>
                </div>
              </div>
            ))}
            
            <div className="flex items-center gap-2 pt-2">
              <div className="flex -space-x-2">
                {followers.slice(3).map((follower) => (
                  <Avatar key={follower.name} className="h-6 w-6 border-2 border-background">
                    <AvatarFallback className="text-xs">
                      {getInitials(follower.name)}
                    </AvatarFallback>
                  </Avatar>
                ))}
                <div className="h-6 w-6 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                  <span className="text-xs text-muted-foreground">+15</span>
                </div>
              </div>
              <span className="text-xs text-muted-foreground">and 15 others</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Moderation Actions */}
      {isModerator && (
        <Card className="border-orange-200 bg-orange-50/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2 text-orange-700">
              <CheckCircle className="h-5 w-5" />
              Moderation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" size="sm" className="w-full justify-start gap-2">
              <EyeOff className="h-4 w-4" />
              Hide Discussion
            </Button>
            
            <Button variant="outline" size="sm" className="w-full justify-start gap-2 text-destructive hover:text-destructive">
              <Trash2 className="h-4 w-4" />
              Remove Discussion
            </Button>
            
            <Separator className="my-3" />
            
            <Button variant="outline" size="sm" className="w-full justify-start gap-2 text-green-600 hover:text-green-600">
              <CheckCircle className="h-4 w-4" />
              Mark as Helpful
            </Button>
            
            <Button variant="outline" size="sm" className="w-full justify-start gap-2">
              <FolderOpen className="h-4 w-4" />
              Move to Knowledge Base
            </Button>
            
            <div className="text-xs text-muted-foreground mt-3 pt-3 border-t">
              Moderation actions are logged and visible to other moderators.
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}