// Centralized custom hooks exports
// This file provides a single entry point for all custom React hooks

// Discussions hooks
export {
  useDiscussions,
  useDiscussion,
  useTrendingDiscussions,
  useRecentDiscussions,
  useSearchDiscussions,
  useDiscussionsByCategory,
  useUserDiscussions,
  useDiscussionsByTags,
  useDiscussionStats,
  useCreateDiscussion,
  useUpdateDiscussion,
  useDeleteDiscussion,
  useLikeDiscussion,
  useUnlikeDiscussion,
  useDiscussionsData
} from './useDiscussions';

// Knowledge Base hooks
export {
  useKnowledgeArticles,
  useKnowledgeArticle,
  useKnowledgeArticleBySlug,
  usePopularArticles,
  useRecentArticles,
  useSearchArticles,
  useArticlesByCategory,
  useArticlesByAuthor,
  useRelatedArticles,
  useKnowledgeArticleStats,
  useCategoryStats,
  useCreateArticle,
  useUpdateArticle,
  useDeleteArticle,
  useMarkAsHelpful,
  useRemoveHelpfulVote,
  useGenerateSlug,
  useKnowledgeBaseData,
  useKnowledgeBaseByCategory
} from './useKnowledgeBase';

// Polls hooks
export {
  usePolls,
  usePoll,
  useActivePolls,
  useExpiredPolls,
  usePollsByAuthor,
  useUserVotes,
  usePollResults,
  usePollStats,
  useCanUserVote,
  useCreatePoll,
  useUpdatePoll,
  useDeletePoll,
  useVoteOnPoll,
  usePollsData,
  usePollManagement,
  usePollVoting,
  usePollWithResults,
  useUserPollActivity
} from './usePolls';

// Benchmarks hooks
export {
  useBenchmarkMetrics,
  useBenchmarkMetric,
  useAuthorityBenchmarks,
  useMetricComparison,
  useMetricRanking,
  useOverallRank,
  useBenchmarkStats,
  useMetricTrends,
  useAllAuthoritiesBenchmarks,
  useCreateMetric,
  useUpdateMetric,
  useDeleteMetric,
  useSubmitBenchmarkData,
  useExportBenchmarkData,
  useBenchmarksData,
  useAuthorityBenchmarkData,
  useMetricComparisonData,
  useBenchmarkManagement,
  useBenchmarkDataSubmission,
  useBenchmarkDashboard
} from './useBenchmarks';

// Chat hooks
export { useMessages, type Message, type OptimisticMessage } from './useMessages';
export { useThreads, useThreadCount, type Thread } from './useThreads';
export { useChannels, type Channel } from './useChannels';
export { useReactions } from './useReactions';
export { useHousingAuthorities } from './useHousingAuthorities';

// PHA Context
export { PHAProvider, usePHAContext, useCurrentPHA, type HousingAuthority } from '@/contexts/PHAContext';

// Re-export types for convenience
export type {
  // From API services
  ApiResponse,
  PaginationParams,
  SortParams,
  FilterParams,
  DiscussionWithAuthor,
  DiscussionWithReplies,
  DiscussionStats,
  KnowledgeArticleWithAuthor,
  KnowledgeArticleStats,
  CategoryStats,
  PollWithOptions,
  PollResults,
  PollStats,
  AuthorityBenchmark,
  BenchmarkComparison,
  BenchmarkStats,
  BenchmarkTrend
} from '@/services/api';

// Hook utility types
export type HookState<T> = {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
};

export type MutationState<T> = {
  mutate: (variables: T) => void;
  mutateAsync: (variables: T) => Promise<any>;
  isPending: boolean;
  isSuccess: boolean;
  isError: boolean;
  error: Error | null;
  data: any;
  reset: () => void;
};

// Utility functions for hooks
export const createHookState = <T>(
  data: T | null,
  isLoading: boolean,
  error: Error | null,
  refetch: () => void
): HookState<T> => ({
  data,
  isLoading,
  error,
  refetch
});

export const createMutationState = <T>(
  mutate: (variables: T) => void,
  mutateAsync: (variables: T) => Promise<any>,
  isPending: boolean,
  isSuccess: boolean,
  isError: boolean,
  error: Error | null,
  data: any,
  reset: () => void
): MutationState<T> => ({
  mutate,
  mutateAsync,
  isPending,
  isSuccess,
  isError,
  error,
  data,
  reset
});

// Hook configuration constants
export const HOOK_CONFIG = {
  // Default stale times (in milliseconds)
  STALE_TIMES: {
    DISCUSSIONS: 5 * 60 * 1000, // 5 minutes
    KNOWLEDGE_ARTICLES: 5 * 60 * 1000, // 5 minutes
    POLLS: 2 * 60 * 1000, // 2 minutes
    BENCHMARKS: 15 * 60 * 1000, // 15 minutes
    STATS: 15 * 60 * 1000, // 15 minutes
    USER_DATA: 5 * 60 * 1000, // 5 minutes
  },
  
  // Default retry counts
  RETRY_COUNTS: {
    DEFAULT: 2,
    CRITICAL: 3,
    NON_CRITICAL: 1,
  },
  
  // Default cache times (in milliseconds)
  CACHE_TIMES: {
    SHORT: 5 * 60 * 1000, // 5 minutes
    MEDIUM: 15 * 60 * 1000, // 15 minutes
    LONG: 30 * 60 * 1000, // 30 minutes
    VERY_LONG: 60 * 60 * 1000, // 1 hour
  }
} as const;

// Hook error handling utilities
export const handleHookError = (error: any): string => {
  if (typeof error === 'string') return error;
  if (error?.message) return error.message;
  if (error?.error_description) return error.error_description;
  return 'An unexpected error occurred';
};

// Hook loading state utilities
export const isLoadingAny = (...hooks: { isLoading: boolean }[]): boolean => {
  return hooks.some(hook => hook.isLoading);
};

export const hasErrorAny = (...hooks: { error: any }[]): boolean => {
  return hooks.some(hook => hook.error);
};

export const getFirstError = (...hooks: { error: any }[]): any => {
  return hooks.find(hook => hook.error)?.error || null;
};

// Hook data utilities
export const combineHookData = <T>(...hooks: { data: T | null }[]): T[] => {
  return hooks
    .map(hook => hook.data)
    .filter((data): data is T => data !== null);
};

// Query key utilities
export const createQueryKey = (baseKey: string, ...params: any[]): any[] => {
  return [baseKey, ...params.filter(param => param !== undefined)];
};

// Hook factory for common patterns
export const createDataHook = <T>(
  queryKey: string[],
  queryFn: () => Promise<ApiResponse<T>>,
  options?: {
    enabled?: boolean;
    staleTime?: number;
    retry?: number;
  }
) => {
  return {
    queryKey,
    queryFn,
    enabled: options?.enabled ?? true,
    staleTime: options?.staleTime ?? HOOK_CONFIG.STALE_TIMES.DEFAULT,
    retry: options?.retry ?? HOOK_CONFIG.RETRY_COUNTS.DEFAULT,
  };
};

// Export all hook categories for easy importing
export const DISCUSSIONS_HOOKS = {
  useDiscussions,
  useDiscussion,
  useTrendingDiscussions,
  useRecentDiscussions,
  useSearchDiscussions,
  useDiscussionsByCategory,
  useUserDiscussions,
  useDiscussionsByTags,
  useDiscussionStats,
  useCreateDiscussion,
  useUpdateDiscussion,
  useDeleteDiscussion,
  useLikeDiscussion,
  useUnlikeDiscussion,
  useDiscussionsData
};

export const KNOWLEDGE_BASE_HOOKS = {
  useKnowledgeArticles,
  useKnowledgeArticle,
  useKnowledgeArticleBySlug,
  usePopularArticles,
  useRecentArticles,
  useSearchArticles,
  useArticlesByCategory,
  useArticlesByAuthor,
  useRelatedArticles,
  useKnowledgeArticleStats,
  useCategoryStats,
  useCreateArticle,
  useUpdateArticle,
  useDeleteArticle,
  useMarkAsHelpful,
  useRemoveHelpfulVote,
  useGenerateSlug,
  useKnowledgeBaseData,
  useKnowledgeBaseByCategory
};

export const POLLS_HOOKS = {
  usePolls,
  usePoll,
  useActivePolls,
  useExpiredPolls,
  usePollsByAuthor,
  useUserVotes,
  usePollResults,
  usePollStats,
  useCanUserVote,
  useCreatePoll,
  useUpdatePoll,
  useDeletePoll,
  useVoteOnPoll,
  usePollsData,
  usePollManagement,
  usePollVoting,
  usePollWithResults,
  useUserPollActivity
};

export const BENCHMARKS_HOOKS = {
  useBenchmarkMetrics,
  useBenchmarkMetric,
  useAuthorityBenchmarks,
  useMetricComparison,
  useMetricRanking,
  useOverallRank,
  useBenchmarkStats,
  useMetricTrends,
  useAllAuthoritiesBenchmarks,
  useCreateMetric,
  useUpdateMetric,
  useDeleteMetric,
  useSubmitBenchmarkData,
  useExportBenchmarkData,
  useBenchmarksData,
  useAuthorityBenchmarkData,
  useMetricComparisonData,
  useBenchmarkManagement,
  useBenchmarkDataSubmission,
  useBenchmarkDashboard
};
