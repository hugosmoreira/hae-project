// Centralized API service exports
// This file provides a single entry point for all API services

// Base API service and utilities
export { 
  BaseApiService, 
  handleApiError, 
  createQueryString,
  type ApiResponse,
  type PaginationParams,
  type SortParams,
  type FilterParams
} from './base';

// Individual API services
export { discussionsApi, DiscussionsApiService } from './discussions';
export { knowledgeBaseApi, KnowledgeBaseApiService } from './knowledgeBase';
export { pollsApi, PollsApiService } from './polls';
export { usersApi, UsersApiService } from './users';
export { benchmarksApi, BenchmarksApiService } from './benchmarks';

// Re-export all types for convenience
export type {
  // Discussions types
  DiscussionWithAuthor,
  DiscussionWithReplies,
  DiscussionStats
} from './discussions';

export type {
  // Knowledge Base types
  KnowledgeArticleWithAuthor,
  KnowledgeArticleStats,
  CategoryStats
} from './knowledgeBase';

export type {
  // Polls types
  PollWithOptions,
  PollStats,
  PollResults
} from './polls';

export type {
  // Users types
  UserWithProfile,
  UserStats,
  UserActivity,
  UserSearchResult
} from './users';

export type {
  // Benchmarks types
  BenchmarkMetric,
  BenchmarkData,
  AuthorityBenchmark,
  BenchmarkComparison,
  BenchmarkStats,
  BenchmarkTrend
} from './benchmarks';

// API service factory function
export const createApiService = (serviceName: string) => {
  const services = {
    discussions: discussionsApi,
    knowledgeBase: knowledgeBaseApi,
    polls: pollsApi,
    users: usersApi,
    benchmarks: benchmarksApi
  };

  return services[serviceName as keyof typeof services];
};

// Utility function to check if all services are available
export const checkApiServices = () => {
  const services = [
    discussionsApi,
    knowledgeBaseApi,
    pollsApi,
    usersApi,
    benchmarksApi
  ];

  return services.every(service => service !== null && service !== undefined);
};

// Common API error handler
export const handleApiResponse = <T>(response: ApiResponse<T>) => {
  if (!response.success) {
    throw new Error(response.error || 'API request failed');
  }
  return response.data;
};

// API service configuration
export const apiConfig = {
  defaultPagination: {
    page: 1,
    limit: 50
  },
  defaultSort: {
    column: 'created_at',
    ascending: false
  },
  maxRetries: 3,
  retryDelay: 1000
};

// Service health check
export const checkServiceHealth = async () => {
  const healthChecks = await Promise.allSettled([
    discussionsApi.getDiscussionStats(),
    knowledgeBaseApi.getArticleStats(),
    pollsApi.getPollStats(),
    usersApi.getUserStats(),
    benchmarksApi.getBenchmarkStats()
  ]);

  const results = healthChecks.map((result, index) => ({
    service: ['discussions', 'knowledgeBase', 'polls', 'users', 'benchmarks'][index],
    status: result.status === 'fulfilled' ? 'healthy' : 'unhealthy',
    error: result.status === 'rejected' ? result.reason : null
  }));

  return {
    overall: results.every(r => r.status === 'healthy') ? 'healthy' : 'degraded',
    services: results
  };
};
