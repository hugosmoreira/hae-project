import React from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, ThumbsUp, Clock, UserPlus } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

// Mock data for discussions
const mockDiscussions = [
  {
    id: 1,
    slug: 'new-hud-guidelines-section-8-inspections',
    title: 'New HUD Guidelines for Section 8 Inspections',
    content: 'Has anyone reviewed the updated inspection protocols? I\'m seeing some changes in the UPCS standards that affect how we handle unit failures...',
    author: 'Sarah Chen',
    role: 'Inspector',
    region: 'Oregon',
    timestamp: '2 hours ago',
    replies: 12,
    likes: 8,
    tags: ['Inspections', 'HUD', 'Section 8'],
    trending: true,
    category: 'Inspections'
  },
  {
    id: 2,
    slug: 'best-practices-virtual-inspections',
    title: 'Best Practices for Virtual Inspections',
    content: 'Our authority has been piloting virtual pre-inspections for emergency situations. What tools and processes have worked best for other authorities?',
    author: 'Mike Rodriguez',
    role: 'Property Management',
    region: 'Washington',
    timestamp: '4 hours ago',
    replies: 7,
    likes: 15,
    tags: ['Virtual Inspections', 'Technology', 'COVID-19'],
    trending: false,
    category: 'Technology'
  },
  {
    id: 3,
    slug: 'budget-planning-fy2024-capital-improvements',
    title: 'Budget Planning for FY2024 - Capital Improvements',
    content: 'Looking for input on prioritizing capital improvement projects. How are other authorities handling the increased costs and supply chain delays?',
    author: 'Jennifer Walsh',
    role: 'Finance',
    region: 'Oregon',
    timestamp: '6 hours ago',
    replies: 23,
    likes: 19,
    tags: ['Budget', 'Capital Improvements', 'Planning'],
    trending: true,
    category: 'Finance'
  },
  {
    id: 4,
    slug: 'training-resources-new-staff',
    title: 'Training Resources for New Staff',
    content: 'We\'re onboarding several new voucher specialists. What are the best training resources and certification programs you\'d recommend?',
    author: 'David Kim',
    role: 'Voucher Specialist',
    region: 'Washington',
    timestamp: '8 hours ago',
    replies: 9,
    likes: 6,
    tags: ['Training', 'Onboarding', 'Staff Development'],
    trending: false,
    category: 'HR'
  },
  {
    id: 5,
    slug: 'compliance-updates-recent-hud-changes',
    title: 'Compliance Updates - Recent HUD Changes',
    content: 'Summary of recent HUD compliance updates that affect housing authorities. Key changes include new reporting requirements and updated fair housing guidelines.',
    author: 'Lisa Thompson',
    role: 'Compliance',
    region: 'Oregon',
    timestamp: '1 day ago',
    replies: 31,
    likes: 42,
    tags: ['Compliance', 'HUD', 'Fair Housing'],
    trending: true,
    category: 'Compliance'
  }
];

interface DiscussionsFeedProps {
  userRole: string;
}

export function DiscussionsFeed({ userRole }: DiscussionsFeedProps) {
  const getInitials = (name: string) => {
    return name.split(' ').map(word => word.charAt(0)).join('').toUpperCase();
  };

  const getTrendingDiscussions = () => {
    return mockDiscussions.filter(discussion => discussion.trending);
  };

  const getRecentDiscussions = () => {
    return mockDiscussions.filter(discussion => !discussion.trending);
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

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
        <CardContent className="p-6">
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Welcome back, {userRole}!
          </h1>
          <p className="text-muted-foreground">
            Here's what's trending in the housing authority community.
          </p>
        </CardContent>
      </Card>

      {/* Trending Discussions */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-xl font-semibold">🔥 Trending Discussions</h2>
          <Badge variant="secondary" className="bg-civic-blue/10 text-civic-blue">
            {getTrendingDiscussions().length} active
          </Badge>
        </div>
        
        <div className="space-y-4">
          {getTrendingDiscussions().map((discussion) => (
            <Link key={discussion.id} to={`/discussions/${discussion.slug}`}>
              <Card className="hover:shadow-lg hover:-translate-y-1 transition-all duration-200 border-l-4 border-l-primary/50">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                        {getInitials(discussion.author)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={getCategoryColor(discussion.category)}>
                          {discussion.category}
                        </Badge>
                        {discussion.trending && (
                          <Badge variant="secondary" className="bg-orange-100 text-orange-700 border-orange-200">
                            🔥 Trending
                          </Badge>
                        )}
                      </div>
                      <h3 className="font-semibold text-lg mb-1 hover:text-primary cursor-pointer transition-colors">
                        {discussion.title}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        <span className="font-medium">{discussion.author}</span>
                        <span>•</span>
                        <span>{discussion.role}</span>
                        <span>•</span>
                        <span>{discussion.region}</span>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {discussion.timestamp}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <p className="text-muted-foreground mb-4 line-clamp-2">
                  {discussion.content}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="flex gap-2 flex-wrap">
                    {discussion.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {discussion.tags.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{discussion.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MessageCircle className="h-4 w-4" />
                        {discussion.replies}
                      </div>
                      <div className="flex items-center gap-1">
                        <ThumbsUp className="h-4 w-4" />
                        {discussion.likes}
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="gap-1 hover:bg-primary hover:text-primary-foreground">
                      <UserPlus className="h-3 w-3" />
                      Follow
                    </Button>
                  </div>
                </div>
              </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Recent Discussions */}
      <section>
        <h2 className="text-xl font-semibold mb-4">💬 Recent Discussions</h2>
        
        <div className="space-y-3">
          {getRecentDiscussions().map((discussion) => (
            <Link key={discussion.id} to={`/discussions/${discussion.slug}`}>
              <Card className="hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
              <CardHeader className="pb-3">
                <div className="flex items-start gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-muted text-xs">
                      {getInitials(discussion.author)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className={getCategoryColor(discussion.category)} variant="outline">
                        {discussion.category}
                      </Badge>
                    </div>
                    <h3 className="font-semibold mb-1 hover:text-primary cursor-pointer transition-colors">
                      {discussion.title}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{discussion.author}</span>
                      <span>•</span>
                      <span>{discussion.role}</span>
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {discussion.timestamp}
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                  {discussion.content}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="flex gap-1 flex-wrap">
                    {discussion.tags.slice(0, 2).map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {discussion.tags.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{discussion.tags.length - 2}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MessageCircle className="h-3 w-3" />
                        {discussion.replies}
                      </div>
                      <div className="flex items-center gap-1">
                        <ThumbsUp className="h-3 w-3" />
                        {discussion.likes}
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="gap-1 text-xs hover:bg-muted">
                      <UserPlus className="h-3 w-3" />
                      Follow
                    </Button>
                  </div>
                </div>
              </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}