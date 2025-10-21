import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { knowledgeBaseApi } from '@/services/api';
import { useKnowledgeBaseLoadingStates } from './useLoadingStates';
import type { 
  KnowledgeArticleWithAuthor, 
  KnowledgeArticleStats,
  CategoryStats,
  PaginationParams,
  SortParams,
  FilterParams
} from '@/services/api';

// Hook for getting all knowledge articles
export function useKnowledgeArticles(
  pagination?: PaginationParams,
  sort?: SortParams,
  filters?: FilterParams
) {
  return useQuery({
    queryKey: ['knowledge-articles', pagination, sort, filters],
    queryFn: () => knowledgeBaseApi.getAllArticles(pagination, sort, filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
}

// Hook for getting a single article by ID
export function useKnowledgeArticle(id: string) {
  return useQuery({
    queryKey: ['knowledge-article', id],
    queryFn: () => knowledgeBaseApi.getArticleById(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
  });
}

// Hook for getting an article by slug
export function useKnowledgeArticleBySlug(slug: string) {
  return useQuery({
    queryKey: ['knowledge-article', 'slug', slug],
    queryFn: () => knowledgeBaseApi.getArticleBySlug(slug),
    enabled: !!slug,
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
  });
}

// Hook for getting popular articles
export function usePopularArticles(limit: number = 10) {
  return useQuery({
    queryKey: ['knowledge-articles', 'popular', limit],
    queryFn: () => knowledgeBaseApi.getPopularArticles(limit),
    staleTime: 15 * 60 * 1000, // 15 minutes
    retry: 2,
  });
}

// Hook for getting recent articles
export function useRecentArticles(limit: number = 10) {
  return useQuery({
    queryKey: ['knowledge-articles', 'recent', limit],
    queryFn: () => knowledgeBaseApi.getRecentArticles(limit),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
}

// Hook for searching articles
export function useSearchArticles(
  searchTerm: string,
  pagination?: PaginationParams,
  filters?: FilterParams
) {
  return useQuery({
    queryKey: ['knowledge-articles', 'search', searchTerm, pagination, filters],
    queryFn: () => knowledgeBaseApi.searchArticles(searchTerm, pagination, filters),
    enabled: searchTerm.length > 2,
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 2,
  });
}

// Hook for getting articles by category
export function useArticlesByCategory(
  category: string,
  pagination?: PaginationParams,
  sort?: SortParams
) {
  return useQuery({
    queryKey: ['knowledge-articles', 'category', category, pagination, sort],
    queryFn: () => knowledgeBaseApi.getArticlesByCategory(category, pagination, sort),
    enabled: !!category,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
}

// Hook for getting articles by author
export function useArticlesByAuthor(
  authorId: string,
  pagination?: PaginationParams
) {
  return useQuery({
    queryKey: ['knowledge-articles', 'author', authorId, pagination],
    queryFn: () => knowledgeBaseApi.getArticlesByAuthor(authorId, pagination),
    enabled: !!authorId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
}

// Hook for getting related articles
export function useRelatedArticles(
  articleId: string,
  limit: number = 5
) {
  return useQuery({
    queryKey: ['knowledge-articles', 'related', articleId, limit],
    queryFn: () => knowledgeBaseApi.getRelatedArticles(articleId, limit),
    enabled: !!articleId,
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
  });
}

// Hook for getting article statistics
export function useKnowledgeArticleStats() {
  return useQuery({
    queryKey: ['knowledge-articles', 'stats'],
    queryFn: () => knowledgeBaseApi.getArticleStats(),
    staleTime: 15 * 60 * 1000, // 15 minutes
    retry: 2,
  });
}

// Hook for getting category statistics
export function useCategoryStats() {
  return useQuery({
    queryKey: ['knowledge-articles', 'category-stats'],
    queryFn: () => knowledgeBaseApi.getCategoryStats(),
    staleTime: 30 * 60 * 1000, // 30 minutes
    retry: 2,
  });
}

// Hook for creating an article
export function useCreateArticle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: knowledgeBaseApi.createArticle,
    onSuccess: () => {
      // Invalidate and refetch articles
      queryClient.invalidateQueries({ queryKey: ['knowledge-articles'] });
      queryClient.invalidateQueries({ queryKey: ['knowledge-articles', 'stats'] });
      queryClient.invalidateQueries({ queryKey: ['knowledge-articles', 'category-stats'] });
    },
  });
}

// Hook for updating an article
export function useUpdateArticle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: any }) =>
      knowledgeBaseApi.updateArticle(id, updates),
    onSuccess: (_, { id }) => {
      // Invalidate specific article and all articles
      queryClient.invalidateQueries({ queryKey: ['knowledge-article', id] });
      queryClient.invalidateQueries({ queryKey: ['knowledge-articles'] });
      queryClient.invalidateQueries({ queryKey: ['knowledge-articles', 'stats'] });
    },
  });
}

// Hook for deleting an article
export function useDeleteArticle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: knowledgeBaseApi.deleteArticle,
    onSuccess: () => {
      // Invalidate all articles
      queryClient.invalidateQueries({ queryKey: ['knowledge-articles'] });
      queryClient.invalidateQueries({ queryKey: ['knowledge-articles', 'stats'] });
      queryClient.invalidateQueries({ queryKey: ['knowledge-articles', 'category-stats'] });
    },
  });
}

// Hook for marking an article as helpful
export function useMarkAsHelpful() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ articleId, userId }: { articleId: string; userId: string }) =>
      knowledgeBaseApi.markAsHelpful(articleId, userId),
    onSuccess: (_, { articleId }) => {
      // Invalidate specific article and popular articles
      queryClient.invalidateQueries({ queryKey: ['knowledge-article', articleId] });
      queryClient.invalidateQueries({ queryKey: ['knowledge-articles', 'popular'] });
      queryClient.invalidateQueries({ queryKey: ['knowledge-articles', 'stats'] });
    },
  });
}

// Hook for removing helpful vote
export function useRemoveHelpfulVote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ articleId, userId }: { articleId: string; userId: string }) =>
      knowledgeBaseApi.removeHelpfulVote(articleId, userId),
    onSuccess: (_, { articleId }) => {
      // Invalidate specific article and popular articles
      queryClient.invalidateQueries({ queryKey: ['knowledge-article', articleId] });
      queryClient.invalidateQueries({ queryKey: ['knowledge-articles', 'popular'] });
      queryClient.invalidateQueries({ queryKey: ['knowledge-articles', 'stats'] });
    },
  });
}

// Hook for generating a unique slug
export function useGenerateSlug() {
  return useMutation({
    mutationFn: knowledgeBaseApi.generateSlug,
  });
}

// Combined hook for knowledge base operations
export function useKnowledgeBaseData() {
  const articles = useKnowledgeArticles();
  const popular = usePopularArticles();
  const recent = useRecentArticles();
  const stats = useKnowledgeArticleStats();
  const categoryStats = useCategoryStats();

  return {
    articles,
    popular,
    recent,
    stats,
    categoryStats,
    isLoading: articles.isLoading || popular.isLoading || recent.isLoading || stats.isLoading || categoryStats.isLoading,
    error: articles.error || popular.error || recent.error || stats.error || categoryStats.error,
  };
}

// Hook for category-based article loading
export function useKnowledgeBaseByCategory(category: string) {
  const articles = useArticlesByCategory(category);
  const stats = useKnowledgeArticleStats();
  const categoryStats = useCategoryStats();

  return {
    articles,
    stats,
    categoryStats,
    isLoading: articles.isLoading || stats.isLoading || categoryStats.isLoading,
    error: articles.error || stats.error || categoryStats.error,
  };
}

// Enhanced hook with loading states and UI components
export function useKnowledgeArticlesWithLoading(
  pagination?: PaginationParams,
  sort?: SortParams,
  filters?: FilterParams,
  config?: {
    showSkeleton?: boolean;
    skeletonCount?: number;
    emptyStateProps?: {
      onCreateArticle?: () => void;
      onSearch?: () => void;
    };
  }
) {
  const articles = useKnowledgeArticles(pagination, sort, filters);
  
  const loadingStates = useKnowledgeBaseLoadingStates(
    articles.data,
    articles.isLoading,
    articles.error,
    {
      showSkeleton: config?.showSkeleton ?? true,
      skeletonCount: config?.skeletonCount ?? 6,
      emptyStateProps: config?.emptyStateProps
    }
  );

  return {
    ...articles,
    ...loadingStates,
    hasData: !!articles.data && articles.data.length > 0,
    isEmpty: !articles.data || articles.data.length === 0,
    shouldShowLoading: articles.isLoading && !articles.data,
    shouldShowEmpty: !articles.isLoading && (!articles.data || articles.data.length === 0),
    shouldShowError: !!articles.error && !articles.isLoading,
    shouldShowData: !articles.isLoading && !!articles.data && articles.data.length > 0 && !articles.error
  };
}

// Enhanced hook for popular articles with loading states
export function usePopularArticlesWithLoading(
  limit: number = 10,
  config?: {
    showSkeleton?: boolean;
    skeletonCount?: number;
    emptyStateProps?: {
      onCreateArticle?: () => void;
      onBrowse?: () => void;
    };
  }
) {
  const popular = usePopularArticles(limit);
  
  const loadingStates = useKnowledgeBaseLoadingStates(
    popular.data,
    popular.isLoading,
    popular.error,
    {
      showSkeleton: config?.showSkeleton ?? true,
      skeletonCount: config?.skeletonCount ?? 10,
      emptyStateProps: config?.emptyStateProps
    }
  );

  return {
    ...popular,
    ...loadingStates,
    hasData: !!popular.data && popular.data.length > 0,
    isEmpty: !popular.data || popular.data.length === 0
  };
}

// Enhanced hook for search articles with loading states
export function useSearchArticlesWithLoading(
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
  const search = useSearchArticles(searchTerm, pagination, filters);
  
  const loadingStates = useKnowledgeBaseLoadingStates(
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

// Enhanced hook for articles by category with loading states
export function useArticlesByCategoryWithLoading(
  category: string,
  pagination?: PaginationParams,
  sort?: SortParams,
  config?: {
    showSkeleton?: boolean;
    skeletonCount?: number;
    emptyStateProps?: {
      onCreateArticle?: () => void;
      onBrowse?: () => void;
    };
  }
) {
  const articles = useArticlesByCategory(category, pagination, sort);
  
  const loadingStates = useKnowledgeBaseLoadingStates(
    articles.data,
    articles.isLoading,
    articles.error,
    {
      showSkeleton: config?.showSkeleton ?? true,
      skeletonCount: config?.skeletonCount ?? 6,
      emptyStateProps: config?.emptyStateProps
    }
  );

  return {
    ...articles,
    ...loadingStates,
    hasData: !!articles.data && articles.data.length > 0,
    isEmpty: !articles.data || articles.data.length === 0
  };
}
