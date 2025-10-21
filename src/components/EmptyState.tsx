import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  MessageCircle, 
  BookOpen, 
  BarChart3, 
  TrendingUp, 
  Plus, 
  Search,
  Users,
  FileText,
  Target,
  Lightbulb
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive';
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
    variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive';
  };
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  secondaryAction,
  className,
  size = 'md'
}) => {
  const sizeClasses = {
    sm: 'p-4',
    md: 'p-8',
    lg: 'p-12'
  };

  const iconSizes = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16'
  };

  return (
    <Card className={cn('text-center', sizeClasses[size], className)}>
      <CardContent className="flex flex-col items-center justify-center space-y-4">
        {icon && (
          <div className={cn(
            'text-muted-foreground',
            iconSizes[size]
          )}>
            {icon}
          </div>
        )}
        
        <div className="space-y-2">
          <h3 className={cn(
            'font-semibold text-foreground',
            size === 'sm' && 'text-lg',
            size === 'md' && 'text-xl',
            size === 'lg' && 'text-2xl'
          )}>
            {title}
          </h3>
          <p className={cn(
            'text-muted-foreground',
            size === 'sm' && 'text-sm',
            size === 'md' && 'text-base',
            size === 'lg' && 'text-lg'
          )}>
            {description}
          </p>
        </div>
        
        {(action || secondaryAction) && (
          <div className="flex flex-col sm:flex-row gap-2 pt-4">
            {action && (
              <Button 
                onClick={action.onClick}
                variant={action.variant || 'default'}
                size={size === 'sm' ? 'sm' : 'default'}
              >
                {action.label}
              </Button>
            )}
            {secondaryAction && (
              <Button 
                onClick={secondaryAction.onClick}
                variant={secondaryAction.variant || 'outline'}
                size={size === 'sm' ? 'sm' : 'default'}
              >
                {secondaryAction.label}
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Predefined empty states for different sections
export const EmptyDiscussions: React.FC<{
  onCreateDiscussion?: () => void;
  onBrowse?: () => void;
  className?: string;
}> = ({ onCreateDiscussion, onBrowse, className }) => (
  <EmptyState
    icon={<MessageCircle className="h-12 w-12" />}
    title="Nothing here yet – be the first to post!"
    description="Start the conversation and share your insights with the housing authority community."
    action={onCreateDiscussion ? {
      label: 'Start Discussion',
      onClick: onCreateDiscussion
    } : undefined}
    secondaryAction={onBrowse ? {
      label: 'Browse Topics',
      onClick: onBrowse
    } : undefined}
    className={className}
  />
);

export const EmptyKnowledgeBase: React.FC<{
  onCreateArticle?: () => void;
  onSearch?: () => void;
  className?: string;
}> = ({ onCreateArticle, onSearch, className }) => (
  <EmptyState
    icon={<BookOpen className="h-12 w-12" />}
    title="No articles found"
    description="Help build our community knowledge base by sharing your expertise and best practices."
    action={onCreateArticle ? {
      label: 'Create Article',
      onClick: onCreateArticle
    } : undefined}
    secondaryAction={onSearch ? {
      label: 'Search Articles',
      onClick: onSearch
    } : undefined}
    className={className}
  />
);

export const EmptyPolls: React.FC<{
  onCreatePoll?: () => void;
  onBrowse?: () => void;
  className?: string;
}> = ({ onCreatePoll, onBrowse, className }) => (
  <EmptyState
    icon={<BarChart3 className="h-12 w-12" />}
    title="No polls available"
    description="No active polls at the moment. Create a poll to gather insights from the community."
    action={onCreatePoll ? {
      label: 'Create Poll',
      onClick: onCreatePoll
    } : undefined}
    secondaryAction={onBrowse ? {
      label: 'Browse Polls',
      onClick: onBrowse
    } : undefined}
    className={className}
  />
);

export const EmptyBenchmarks: React.FC<{
  onSubmitData?: () => void;
  onViewMetrics?: () => void;
  className?: string;
}> = ({ onSubmitData, onViewMetrics, className }) => (
  <EmptyState
    icon={<TrendingUp className="h-12 w-12" />}
    title="No benchmark data"
    description="No performance data available yet. Submit your authority's metrics to start comparing with peers."
    action={onSubmitData ? {
      label: 'Submit Data',
      onClick: onSubmitData
    } : undefined}
    secondaryAction={onViewMetrics ? {
      label: 'View Metrics',
      onClick: onViewMetrics
    } : undefined}
    className={className}
  />
);

export const EmptySearchResults: React.FC<{
  searchTerm?: string;
  onClearSearch?: () => void;
  className?: string;
}> = ({ searchTerm, onClearSearch, className }) => (
  <EmptyState
    icon={<Search className="h-12 w-12" />}
    title={searchTerm ? `No results for "${searchTerm}"` : 'No search results'}
    description={searchTerm 
      ? "Try adjusting your search terms or browse different categories."
      : "Enter a search term to find relevant content."
    }
    action={onClearSearch ? {
      label: 'Clear Search',
      onClick: onClearSearch,
      variant: 'outline'
    } : undefined}
    className={className}
  />
);

export const EmptyUserActivity: React.FC<{
  onExplore?: () => void;
  className?: string;
}> = ({ onExplore, className }) => (
  <EmptyState
    icon={<Users className="h-12 w-12" />}
    title="No activity yet"
    description="Start engaging with the community to see your activity here."
    action={onExplore ? {
      label: 'Explore Community',
      onClick: onExplore
    } : undefined}
    className={className}
  />
);

export const EmptyNotifications: React.FC<{
  onMarkAllRead?: () => void;
  className?: string;
}> = ({ onMarkAllRead, className }) => (
  <EmptyState
    icon={<FileText className="h-12 w-12" />}
    title="No notifications"
    description="You're all caught up! New notifications will appear here."
    action={onMarkAllRead ? {
      label: 'Mark All Read',
      onClick: onMarkAllRead,
      variant: 'outline'
    } : undefined}
    className={className}
  />
);

export const EmptyBookmarks: React.FC<{
  onBrowse?: () => void;
  className?: string;
}> = ({ onBrowse, className }) => (
  <EmptyState
    icon={<Target className="h-12 w-12" />}
    title="No bookmarks yet"
    description="Save interesting discussions and articles to find them easily later."
    action={onBrowse ? {
      label: 'Browse Content',
      onClick: onBrowse
    } : undefined}
    className={className}
  />
);

export const EmptyFavorites: React.FC<{
  onDiscover?: () => void;
  className?: string;
}> = ({ onDiscover, className }) => (
  <EmptyState
    icon={<Lightbulb className="h-12 w-12" />}
    title="No favorites yet"
    description="Like and save content to build your personal collection of helpful resources."
    action={onDiscover ? {
      label: 'Discover Content',
      onClick: onDiscover
    } : undefined}
    className={className}
  />
);

// Generic empty state with customizable icon
export const CustomEmptyState: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive';
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
    variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive';
  };
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}> = (props) => <EmptyState {...props} />;

export default EmptyState;
