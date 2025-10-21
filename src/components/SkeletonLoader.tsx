import React from 'react';
import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
  children?: React.ReactNode;
}

const Skeleton: React.FC<SkeletonProps> = ({ className, children, ...props }) => {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-muted shimmer',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

// Card skeleton for discussions, articles, polls
export const CardSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('p-6 border border-border rounded-lg bg-card', className)}>
    <div className="flex items-start space-x-4">
      <Skeleton className="h-10 w-10 rounded-full" />
      <div className="space-y-2 flex-1">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-3 w-1/4" />
      </div>
    </div>
    <div className="mt-4 space-y-2">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <Skeleton className="h-4 w-4/6" />
    </div>
    <div className="mt-4 flex items-center justify-between">
      <div className="flex space-x-2">
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
      <div className="flex space-x-4">
        <Skeleton className="h-4 w-12" />
        <Skeleton className="h-4 w-8" />
      </div>
    </div>
  </div>
);

// List skeleton for simple lists
export const ListSkeleton: React.FC<{ 
  items?: number; 
  className?: string;
  showAvatar?: boolean;
}> = ({ items = 3, className, showAvatar = true }) => (
  <div className={cn('space-y-4', className)}>
    {Array.from({ length: items }).map((_, i) => (
      <div key={i} className="flex items-center space-x-4 p-4">
        {showAvatar && <Skeleton className="h-8 w-8 rounded-full" />}
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
        <Skeleton className="h-4 w-16" />
      </div>
    ))}
  </div>
);

// Table skeleton
export const TableSkeleton: React.FC<{ 
  rows?: number; 
  columns?: number;
  className?: string;
}> = ({ rows = 5, columns = 4, className }) => (
  <div className={cn('space-y-3', className)}>
    {/* Header */}
    <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
      {Array.from({ length: columns }).map((_, i) => (
        <Skeleton key={i} className="h-4 w-full" />
      ))}
    </div>
    {/* Rows */}
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {Array.from({ length: columns }).map((_, j) => (
          <Skeleton key={j} className="h-4 w-full" />
        ))}
      </div>
    ))}
  </div>
);

// Discussion card skeleton
export const DiscussionCardSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('p-6 border border-border rounded-lg bg-card', className)}>
    <div className="flex items-start justify-between mb-4">
      <div className="flex items-center space-x-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
      <div className="flex space-x-2">
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
    </div>
    
    <div className="space-y-3 mb-4">
      <Skeleton className="h-6 w-4/5" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
    </div>
    
    <div className="flex items-center justify-between">
      <div className="flex space-x-1">
        <Skeleton className="h-5 w-12 rounded-full" />
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-5 w-14 rounded-full" />
      </div>
      <div className="flex items-center space-x-4">
        <Skeleton className="h-4 w-12" />
        <Skeleton className="h-4 w-8" />
        <Skeleton className="h-8 w-16 rounded" />
      </div>
    </div>
  </div>
);

// Knowledge base article skeleton
export const ArticleCardSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('p-6 border border-border rounded-lg bg-card', className)}>
    <div className="flex items-start justify-between mb-4">
      <div className="space-y-2 flex-1">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
      <Skeleton className="h-6 w-20 rounded-full" />
    </div>
    
    <div className="space-y-2 mb-4">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <Skeleton className="h-4 w-2/3" />
    </div>
    
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <Skeleton className="h-6 w-6 rounded-full" />
        <Skeleton className="h-4 w-20" />
      </div>
      <div className="flex items-center space-x-2">
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-4 w-8" />
      </div>
    </div>
  </div>
);

// Poll card skeleton
export const PollCardSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('p-6 border border-border rounded-lg bg-card', className)}>
    <div className="flex items-start justify-between mb-4">
      <div className="space-y-2 flex-1">
        <Skeleton className="h-6 w-4/5" />
        <Skeleton className="h-4 w-1/2" />
      </div>
      <Skeleton className="h-6 w-16 rounded-full" />
    </div>
    
    <div className="space-y-3 mb-4">
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-2 w-full rounded-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-2 w-4/5 rounded-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-2 w-3/5 rounded-full" />
      </div>
    </div>
    
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-12" />
      </div>
      <Skeleton className="h-8 w-20 rounded" />
    </div>
  </div>
);

// Chat message skeleton
export const MessageSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('flex space-x-3 p-4', className)}>
    <Skeleton className="h-8 w-8 rounded-full" />
    <div className="space-y-2 flex-1">
      <div className="flex items-center space-x-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-3 w-16" />
      </div>
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  </div>
);

// Profile skeleton
export const ProfileSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('p-6 border border-border rounded-lg bg-card', className)}>
    <div className="flex items-center space-x-4 mb-6">
      <Skeleton className="h-16 w-16 rounded-full" />
      <div className="space-y-2">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-4 w-24" />
      </div>
    </div>
    
    <div className="space-y-4">
      <div className="space-y-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  </div>
);

// Grid skeleton for multiple cards
export const GridSkeleton: React.FC<{ 
  items?: number;
  columns?: number;
  className?: string;
  cardType?: 'discussion' | 'article' | 'poll';
}> = ({ items = 6, columns = 3, className, cardType = 'discussion' }) => {
  const CardComponent = cardType === 'discussion' ? DiscussionCardSkeleton :
                       cardType === 'article' ? ArticleCardSkeleton :
                       cardType === 'poll' ? PollCardSkeleton :
                       CardSkeleton;

  return (
    <div 
      className={cn('grid gap-6', className)}
      style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
    >
      {Array.from({ length: items }).map((_, i) => (
        <CardComponent key={i} />
      ))}
    </div>
  );
};

export default Skeleton;
