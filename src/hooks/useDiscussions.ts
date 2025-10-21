import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { discussionsApi } from '@/services/api';
import { useDiscussionsLoadingStates } from './useLoadingStates';
import type { 
  DiscussionWithAuthor, 
  DiscussionWithReplies, 
  DiscussionStats,
  PaginationParams,
  SortParams,
  FilterParams
} from '@/services/api';

// Hook for getting all discussions
export function useDiscussions(
  pagination?: PaginationParams,
  sort?: SortParams,
  filters?: FilterParams
) {
  return useQuery({
    queryKey: ['discussions', pagination, sort, filters],
    queryFn: () => discussionsApi.getAllDiscussions(pagination, sort, filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
}

// Hook for getting a single discussion by ID
export function useDiscussion(id: string) {
  return useQuery({
    queryKey: ['discussion', id],
    queryFn: () => discussionsApi.getDiscussionById(id),
    enabled: !!id,
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 2,
  });
}

// Hook for getting trending discussions
export function useTrendingDiscussions(limit: number = 5) {
  return useQuery({
    queryKey: ['discussions', 'trending', limit],
    queryFn: () => discussionsApi.getTrendingDiscussions(limit),
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
  });
}

// Hook for getting recent discussions
export function useRecentDiscussions(limit: number = 10) {
  return useQuery({
    queryKey: ['discussions', 'recent', limit],
    queryFn: () => discussionsApi.getRecentDiscussions(limit),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
}

// Hook for searching discussions
export function useSearchDiscussions(
  searchTerm: string,
  pagination?: PaginationParams,
  filters?: FilterParams
) {
  return useQuery({
    queryKey: ['discussions', 'search', searchTerm, pagination, filters],
    queryFn: () => discussionsApi.searchDiscussions(searchTerm, pagination, filters),
    enabled: searchTerm.length > 2,
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 2,
  });
}

// Hook for getting discussions by category
export function useDiscussionsByCategory(
  category: string,
  pagination?: PaginationParams,
  sort?: SortParams
) {
  return useQuery({
    queryKey: ['discussions', 'category', category, pagination, sort],
    queryFn: () => discussionsApi.getDiscussionsByCategory(category, pagination, sort),
    enabled: !!category,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
}

// Hook for getting user's discussions
export function useUserDiscussions(
  userId: string,
  pagination?: PaginationParams
) {
  return useQuery({
    queryKey: ['discussions', 'user', userId, pagination],
    queryFn: () => discussionsApi.getUserDiscussions(userId, pagination),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
}

// Hook for getting discussions by tags
export function useDiscussionsByTags(
  tags: string[],
  pagination?: PaginationParams
) {
  return useQuery({
    queryKey: ['discussions', 'tags', tags, pagination],
    queryFn: () => discussionsApi.getDiscussionsByTags(tags, pagination),
    enabled: tags.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
}

// Hook for getting discussion statistics
export function useDiscussionStats() {
  return useQuery({
    queryKey: ['discussions', 'stats'],
    queryFn: () => discussionsApi.getDiscussionStats(),
    staleTime: 15 * 60 * 1000, // 15 minutes
    retry: 2,
  });
}

// Hook for creating a discussion
export function useCreateDiscussion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: discussionsApi.createDiscussion,
    onSuccess: () => {
      // Invalidate and refetch discussions
      queryClient.invalidateQueries({ queryKey: ['discussions'] });
      queryClient.invalidateQueries({ queryKey: ['discussions', 'stats'] });
    },
  });
}

// Hook for updating a discussion
export function useUpdateDiscussion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: any }) =>
      discussionsApi.updateDiscussion(id, updates),
    onSuccess: (_, { id }) => {
      // Invalidate specific discussion and all discussions
      queryClient.invalidateQueries({ queryKey: ['discussion', id] });
      queryClient.invalidateQueries({ queryKey: ['discussions'] });
    },
  });
}

// Hook for deleting a discussion
export function useDeleteDiscussion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: discussionsApi.deleteDiscussion,
    onSuccess: () => {
      // Invalidate all discussions
      queryClient.invalidateQueries({ queryKey: ['discussions'] });
      queryClient.invalidateQueries({ queryKey: ['discussions', 'stats'] });
    },
  });
}

// Hook for liking a discussion
export function useLikeDiscussion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ discussionId, userId }: { discussionId: string; userId: string }) =>
      discussionsApi.likeDiscussion(discussionId, userId),
    onSuccess: (_, { discussionId }) => {
      // Invalidate specific discussion and trending discussions
      queryClient.invalidateQueries({ queryKey: ['discussion', discussionId] });
      queryClient.invalidateQueries({ queryKey: ['discussions', 'trending'] });
    },
  });
}

// Hook for unliking a discussion
export function useUnlikeDiscussion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ discussionId, userId }: { discussionId: string; userId: string }) =>
      discussionsApi.unlikeDiscussion(discussionId, userId),
    onSuccess: (_, { discussionId }) => {
      // Invalidate specific discussion and trending discussions
      queryClient.invalidateQueries({ queryKey: ['discussion', discussionId] });
      queryClient.invalidateQueries({ queryKey: ['discussions', 'trending'] });
    },
  });
}

// Combined hook for discussion operations
export function useDiscussionsData() {
  const discussions = useDiscussions();
  const trending = useTrendingDiscussions();
  const recent = useRecentDiscussions();
  const stats = useDiscussionStats();

  return {
    discussions,
    trending,
    recent,
    stats,
    isLoading: discussions.isLoading || trending.isLoading || recent.isLoading || stats.isLoading,
    error: discussions.error || trending.error || recent.error || stats.error,
  };
}

// Enhanced hook with loading states and UI components
export function useDiscussionsWithLoading(
  pagination?: PaginationParams,
  sort?: SortParams,
  filters?: FilterParams,
  config?: {
    showSkeleton?: boolean;
    skeletonCount?: number;
    emptyStateProps?: {
      onCreateDiscussion?: () => void;
      onBrowse?: () => void;
    };
  }
) {
  const discussions = useDiscussions(pagination, sort, filters);
  
  const loadingStates = useDiscussionsLoadingStates(
    discussions.data,
    discussions.isLoading,
    discussions.error,
    {
      showSkeleton: config?.showSkeleton ?? true,
      skeletonCount: config?.skeletonCount ?? 6,
      emptyStateProps: config?.emptyStateProps
    }
  );

  return {
    ...discussions,
    ...loadingStates,
    // Additional convenience properties
    hasData: !!discussions.data && discussions.data.length > 0,
    isEmpty: !discussions.data || discussions.data.length === 0,
    shouldShowLoading: discussions.isLoading && !discussions.data,
    shouldShowEmpty: !discussions.isLoading && (!discussions.data || discussions.data.length === 0),
    shouldShowError: !!discussions.error && !discussions.isLoading,
    shouldShowData: !discussions.isLoading && !!discussions.data && discussions.data.length > 0 && !discussions.error
  };
}

// Enhanced hook for trending discussions with loading states
export function useTrendingDiscussionsWithLoading(
  limit: number = 5,
  config?: {
    showSkeleton?: boolean;
    skeletonCount?: number;
    emptyStateProps?: {
      onCreateDiscussion?: () => void;
      onBrowse?: () => void;
    };
  }
) {
  const trending = useTrendingDiscussions(limit);
  
  const loadingStates = useDiscussionsLoadingStates(
    trending.data,
    trending.isLoading,
    trending.error,
    {
      showSkeleton: config?.showSkeleton ?? true,
      skeletonCount: config?.skeletonCount ?? 5,
      emptyStateProps: config?.emptyStateProps
    }
  );

  return {
    ...trending,
    ...loadingStates,
    hasData: !!trending.data && trending.data.length > 0,
    isEmpty: !trending.data || trending.data.length === 0
  };
}

// Enhanced hook for recent discussions with loading states
export function useRecentDiscussionsWithLoading(
  limit: number = 10,
  config?: {
    showSkeleton?: boolean;
    skeletonCount?: number;
    emptyStateProps?: {
      onCreateDiscussion?: () => void;
      onBrowse?: () => void;
    };
  }
) {
  const recent = useRecentDiscussions(limit);
  
  const loadingStates = useDiscussionsLoadingStates(
    recent.data,
    recent.isLoading,
    recent.error,
    {
      showSkeleton: config?.showSkeleton ?? true,
      skeletonCount: config?.skeletonCount ?? 10,
      emptyStateProps: config?.emptyStateProps
    }
  );

  return {
    ...recent,
    ...loadingStates,
    hasData: !!recent.data && recent.data.length > 0,
    isEmpty: !recent.data || recent.data.length === 0
  };
}

// Enhanced hook for search discussions with loading states
export function useSearchDiscussionsWithLoading(
  searchTerm: string,
  pagination?: PaginationParams,
  filters?: FilterParams,
  config?: {
    showSkeleton?: boolean;
    skeletonCount?: number;
    emptyStateProps?: {
      onClearSearch?: () => void;
      onBrowse?: () => void;
      searchTerm?: string;
    };
  }
) {
  const search = useSearchDiscussions(searchTerm, pagination, filters);
  
  const loadingStates = useDiscussionsLoadingStates(
    search.data,
    search.isLoading,
    search.error,
    {
      showSkeleton: config?.showSkeleton ?? true,
      skeletonCount: config?.skeletonCount ?? 6,
      emptyStateProps: {
        ...config?.emptyStateProps,
        searchTerm: searchTerm
      }
    }
  );

  return {
    ...search,
    ...loadingStates,
    hasData: !!search.data && search.data.length > 0,
    isEmpty: !search.data || search.data.length === 0
  };
}
