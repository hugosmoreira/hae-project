import { useMemo } from 'react';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { 
  EmptyDiscussions, 
  EmptyKnowledgeBase, 
  EmptyPolls, 
  EmptyBenchmarks,
  EmptySearchResults 
} from '@/components/EmptyState';
import { 
  DiscussionCardSkeleton, 
  ArticleCardSkeleton, 
  PollCardSkeleton,
  GridSkeleton 
} from '@/components/SkeletonLoader';

// Loading state types
export interface LoadingState {
  isLoading: boolean;
  error: Error | null;
  data: any[] | null;
  isEmpty: boolean;
}

export interface LoadingStateConfig {
  showSkeleton?: boolean;
  skeletonCount?: number;
  skeletonType?: 'discussion' | 'article' | 'poll' | 'generic';
  emptyStateProps?: {
    onCreate?: () => void;
    onBrowse?: () => void;
    onSearch?: () => void;
    searchTerm?: string;
  };
}

// Hook for managing loading states with UI components
export function useLoadingStates<T>(
  loadingState: LoadingState,
  config: LoadingStateConfig = {}
) {
  const {
    showSkeleton = true,
    skeletonCount = 6,
    skeletonType = 'generic',
    emptyStateProps = {}
  } = config;

  const { isLoading, error, data, isEmpty } = loadingState;

  // Determine what to render based on state
  const renderContent = useMemo(() => {
    // Error state
    if (error) {
      return (
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <div className="text-destructive mb-2">⚠️</div>
            <h3 className="font-semibold text-lg mb-2">Something went wrong</h3>
            <p className="text-muted-foreground mb-4">{error.message}</p>
            <button 
              onClick={() => window.location.reload()}
              className="text-primary hover:underline"
            >
              Try again
            </button>
          </div>
        </div>
      );
    }

    // Loading state
    if (isLoading) {
      if (showSkeleton) {
        switch (skeletonType) {
          case 'discussion':
            return <GridSkeleton items={skeletonCount} cardType="discussion" />;
          case 'article':
            return <GridSkeleton items={skeletonCount} cardType="article" />;
          case 'poll':
            return <GridSkeleton items={skeletonCount} cardType="poll" />;
          default:
            return <GridSkeleton items={skeletonCount} />;
        }
      } else {
        return (
          <div className="flex items-center justify-center p-8">
            <LoadingSpinner size="lg" text="Loading..." />
          </div>
        );
      }
    }

    // Empty state
    if (isEmpty || !data || data.length === 0) {
      switch (skeletonType) {
        case 'discussion':
          return <EmptyDiscussions {...emptyStateProps} />;
        case 'article':
          return <EmptyKnowledgeBase {...emptyStateProps} />;
        case 'poll':
          return <EmptyPolls {...emptyStateProps} />;
        default:
          return <EmptySearchResults {...emptyStateProps} />;
      }
    }

    // Data is available
    return null;
  }, [isLoading, error, data, isEmpty, showSkeleton, skeletonCount, skeletonType, emptyStateProps]);

  // Return loading state info
  return {
    renderContent,
    isLoading,
    error,
    isEmpty,
    hasData: data && data.length > 0
  };
}

// Hook for discussions loading states
export function useDiscussionsLoadingStates(
  discussions: any[] | null,
  isLoading: boolean,
  error: Error | null,
  config: Omit<LoadingStateConfig, 'skeletonType'> = {}
) {
  const loadingState: LoadingState = {
    isLoading,
    error,
    data: discussions,
    isEmpty: !discussions || discussions.length === 0
  };

  return useLoadingStates(loadingState, {
    ...config,
    skeletonType: 'discussion'
  });
}

// Hook for knowledge base loading states
export function useKnowledgeBaseLoadingStates(
  articles: any[] | null,
  isLoading: boolean,
  error: Error | null,
  config: Omit<LoadingStateConfig, 'skeletonType'> = {}
) {
  const loadingState: LoadingState = {
    isLoading,
    error,
    data: articles,
    isEmpty: !articles || articles.length === 0
  };

  return useLoadingStates(loadingState, {
    ...config,
    skeletonType: 'article'
  });
}

// Hook for polls loading states
export function usePollsLoadingStates(
  polls: any[] | null,
  isLoading: boolean,
  error: Error | null,
  config: Omit<LoadingStateConfig, 'skeletonType'> = {}
) {
  const loadingState: LoadingState = {
    isLoading,
    error,
    data: polls,
    isEmpty: !polls || polls.length === 0
  };

  return useLoadingStates(loadingState, {
    ...config,
    skeletonType: 'poll'
  });
}

// Hook for benchmarks loading states
export function useBenchmarksLoadingStates(
  benchmarks: any[] | null,
  isLoading: boolean,
  error: Error | null,
  config: Omit<LoadingStateConfig, 'skeletonType'> = {}
) {
  const loadingState: LoadingState = {
    isLoading,
    error,
    data: benchmarks,
    isEmpty: !benchmarks || benchmarks.length === 0
  };

  return useLoadingStates(loadingState, {
    ...config,
    skeletonType: 'generic'
  });
}

// Utility function to create loading state from hook result
export function createLoadingStateFromHook<T>(
  hookResult: { data: T[] | null; isLoading: boolean; error: Error | null }
): LoadingState {
  return {
    isLoading: hookResult.isLoading,
    error: hookResult.error,
    data: hookResult.data,
    isEmpty: !hookResult.data || hookResult.data.length === 0
  };
}

// Utility function to determine if we should show loading UI
export function shouldShowLoading(isLoading: boolean, hasData: boolean): boolean {
  return isLoading && !hasData;
}

// Utility function to determine if we should show empty state
export function shouldShowEmptyState(isLoading: boolean, hasData: boolean, isEmpty: boolean): boolean {
  return !isLoading && (isEmpty || !hasData);
}

// Utility function to determine if we should show error state
export function shouldShowErrorState(error: Error | null, isLoading: boolean): boolean {
  return !!error && !isLoading;
}

// Utility function to determine if we should show data
export function shouldShowData(isLoading: boolean, hasData: boolean, error: Error | null): boolean {
  return !isLoading && hasData && !error;
}

// Loading state constants
export const LOADING_CONFIG = {
  SKELETON_COUNT: {
    SMALL: 3,
    MEDIUM: 6,
    LARGE: 9
  },
  SKELETON_TYPES: {
    DISCUSSION: 'discussion' as const,
    ARTICLE: 'article' as const,
    POLL: 'poll' as const,
    GENERIC: 'generic' as const
  }
} as const;

// Loading state presets
export const LOADING_PRESETS = {
  DISCUSSIONS: {
    showSkeleton: true,
    skeletonCount: 6,
    skeletonType: 'discussion' as const
  },
  KNOWLEDGE_BASE: {
    showSkeleton: true,
    skeletonCount: 6,
    skeletonType: 'article' as const
  },
  POLLS: {
    showSkeleton: true,
    skeletonCount: 4,
    skeletonType: 'poll' as const
  },
  BENCHMARKS: {
    showSkeleton: true,
    skeletonCount: 5,
    skeletonType: 'generic' as const
  }
} as const;
