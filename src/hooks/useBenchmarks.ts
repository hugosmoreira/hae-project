import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { benchmarksApi } from '@/services/api';
import type { 
  BenchmarkMetric,
  BenchmarkData,
  AuthorityBenchmark,
  BenchmarkComparison,
  BenchmarkStats,
  BenchmarkTrend,
  PaginationParams,
  SortParams,
  FilterParams
} from '@/services/api';

// Hook for getting all benchmark metrics
export function useBenchmarkMetrics(
  pagination?: PaginationParams,
  sort?: SortParams,
  filters?: FilterParams
) {
  return useQuery({
    queryKey: ['benchmark-metrics', pagination, sort, filters],
    queryFn: () => benchmarksApi.getMetrics(pagination, sort, filters),
    staleTime: 15 * 60 * 1000, // 15 minutes
    retry: 2,
  });
}

// Hook for getting a single metric by ID
export function useBenchmarkMetric(id: string) {
  return useQuery({
    queryKey: ['benchmark-metric', id],
    queryFn: () => benchmarksApi.getMetricById(id),
    enabled: !!id,
    staleTime: 30 * 60 * 1000, // 30 minutes
    retry: 2,
  });
}

// Hook for getting authority benchmarks
export function useAuthorityBenchmarks(
  authorityId: string,
  period?: string
) {
  return useQuery({
    queryKey: ['authority-benchmarks', authorityId, period],
    queryFn: () => benchmarksApi.getAuthorityBenchmarks(authorityId, period),
    enabled: !!authorityId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
}

// Hook for getting metric comparison
export function useMetricComparison(
  metricId: string,
  period: string
) {
  return useQuery({
    queryKey: ['metric-comparison', metricId, period],
    queryFn: () => benchmarksApi.getMetricComparison(metricId, period),
    enabled: !!metricId && !!period,
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
  });
}

// Hook for getting metric ranking
export function useMetricRanking(
  metricId: string,
  period: string
) {
  return useQuery({
    queryKey: ['metric-ranking', metricId, period],
    queryFn: () => benchmarksApi.getMetricRanking(metricId, period),
    enabled: !!metricId && !!period,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
}

// Hook for getting overall rank
export function useOverallRank(
  authorityId: string,
  period?: string
) {
  return useQuery({
    queryKey: ['overall-rank', authorityId, period],
    queryFn: () => benchmarksApi.getOverallRank(authorityId, period),
    enabled: !!authorityId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
}

// Hook for getting benchmark statistics
export function useBenchmarkStats() {
  return useQuery({
    queryKey: ['benchmarks', 'stats'],
    queryFn: () => benchmarksApi.getBenchmarkStats(),
    staleTime: 30 * 60 * 1000, // 30 minutes
    retry: 2,
  });
}

// Hook for getting metric trends
export function useMetricTrends(
  metricId: string,
  periods: string[]
) {
  return useQuery({
    queryKey: ['metric-trends', metricId, periods],
    queryFn: () => benchmarksApi.getMetricTrends(metricId, periods),
    enabled: !!metricId && periods.length > 0,
    staleTime: 15 * 60 * 1000, // 15 minutes
    retry: 2,
  });
}

// Hook for getting all authorities benchmarks
export function useAllAuthoritiesBenchmarks(
  period: string,
  pagination?: PaginationParams
) {
  return useQuery({
    queryKey: ['all-authorities-benchmarks', period, pagination],
    queryFn: () => benchmarksApi.getAllAuthoritiesBenchmarks(period, pagination),
    enabled: !!period,
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
  });
}

// Hook for creating a metric
export function useCreateMetric() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: benchmarksApi.createMetric,
    onSuccess: () => {
      // Invalidate metrics and stats
      queryClient.invalidateQueries({ queryKey: ['benchmark-metrics'] });
      queryClient.invalidateQueries({ queryKey: ['benchmarks', 'stats'] });
    },
  });
}

// Hook for updating a metric
export function useUpdateMetric() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: any }) =>
      benchmarksApi.updateMetric(id, updates),
    onSuccess: (_, { id }) => {
      // Invalidate specific metric and all metrics
      queryClient.invalidateQueries({ queryKey: ['benchmark-metric', id] });
      queryClient.invalidateQueries({ queryKey: ['benchmark-metrics'] });
    },
  });
}

// Hook for deleting a metric
export function useDeleteMetric() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: benchmarksApi.deleteMetric,
    onSuccess: () => {
      // Invalidate all metrics and stats
      queryClient.invalidateQueries({ queryKey: ['benchmark-metrics'] });
      queryClient.invalidateQueries({ queryKey: ['benchmarks', 'stats'] });
    },
  });
}

// Hook for submitting benchmark data
export function useSubmitBenchmarkData() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: benchmarksApi.submitBenchmarkData,
    onSuccess: (_, data) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['authority-benchmarks', data.authority_id] });
      queryClient.invalidateQueries({ queryKey: ['metric-comparison', data.metric_id] });
      queryClient.invalidateQueries({ queryKey: ['metric-ranking', data.metric_id] });
      queryClient.invalidateQueries({ queryKey: ['overall-rank', data.authority_id] });
      queryClient.invalidateQueries({ queryKey: ['all-authorities-benchmarks'] });
      queryClient.invalidateQueries({ queryKey: ['benchmarks', 'stats'] });
    },
  });
}

// Hook for exporting benchmark data
export function useExportBenchmarkData() {
  return useMutation({
    mutationFn: ({ metricIds, period, format }: { 
      metricIds: string[]; 
      period: string; 
      format?: 'csv' | 'json' 
    }) => benchmarksApi.exportBenchmarkData(metricIds, period, format),
  });
}

// Combined hook for benchmark operations
export function useBenchmarksData() {
  const metrics = useBenchmarkMetrics();
  const stats = useBenchmarkStats();

  return {
    metrics,
    stats,
    isLoading: metrics.isLoading || stats.isLoading,
    error: metrics.error || stats.error,
  };
}

// Hook for authority-specific benchmark data
export function useAuthorityBenchmarkData(authorityId: string, period?: string) {
  const authorityBenchmarks = useAuthorityBenchmarks(authorityId, period);
  const overallRank = useOverallRank(authorityId, period);

  return {
    authorityBenchmarks,
    overallRank,
    isLoading: authorityBenchmarks.isLoading || overallRank.isLoading,
    error: authorityBenchmarks.error || overallRank.error,
  };
}

// Hook for metric comparison data
export function useMetricComparisonData(metricId: string, period: string) {
  const comparison = useMetricComparison(metricId, period);
  const ranking = useMetricRanking(metricId, period);
  const trends = useMetricTrends(metricId, [period]);

  return {
    comparison,
    ranking,
    trends,
    isLoading: comparison.isLoading || ranking.isLoading || trends.isLoading,
    error: comparison.error || ranking.error || trends.error,
  };
}

// Hook for benchmark management (create, update, delete metrics)
export function useBenchmarkManagement() {
  const createMetric = useCreateMetric();
  const updateMetric = useUpdateMetric();
  const deleteMetric = useDeleteMetric();

  return {
    createMetric,
    updateMetric,
    deleteMetric,
    isLoading: createMetric.isPending || updateMetric.isPending || deleteMetric.isPending,
    error: createMetric.error || updateMetric.error || deleteMetric.error,
  };
}

// Hook for benchmark data submission
export function useBenchmarkDataSubmission() {
  const submitData = useSubmitBenchmarkData();
  const exportData = useExportBenchmarkData();

  return {
    submitData,
    exportData,
    isSubmitting: submitData.isPending,
    isExporting: exportData.isPending,
    error: submitData.error || exportData.error,
  };
}

// Hook for comprehensive benchmark dashboard
export function useBenchmarkDashboard(period: string) {
  const allAuthorities = useAllAuthoritiesBenchmarks(period);
  const stats = useBenchmarkStats();
  const metrics = useBenchmarkMetrics();

  return {
    allAuthorities,
    stats,
    metrics,
    isLoading: allAuthorities.isLoading || stats.isLoading || metrics.isLoading,
    error: allAuthorities.error || stats.error || metrics.error,
  };
}
