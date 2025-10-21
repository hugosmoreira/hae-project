import { BaseApiService, type ApiResponse, type PaginationParams, type SortParams, type FilterParams } from './base';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

// Type definitions for benchmarks
type BenchmarkMetric = {
  id: string;
  name: string;
  description: string;
  category: string;
  unit: string;
  higher_is_better: boolean;
  created_at: string;
  updated_at: string;
};

type BenchmarkData = {
  id: string;
  metric_id: string;
  authority_id: string;
  value: number;
  period: string; // e.g., '2024-Q1', '2024-01'
  created_at: string;
  updated_at: string;
};

type AuthorityBenchmark = {
  authority_id: string;
  authority_name: string;
  region: string;
  metrics: Array<{
    metric_id: string;
    metric_name: string;
    value: number;
    rank: number;
    percentile: number;
  }>;
  overall_score: number;
  overall_rank: number;
};

type BenchmarkComparison = {
  metric_id: string;
  metric_name: string;
  unit: string;
  authorities: Array<{
    authority_id: string;
    authority_name: string;
    value: number;
    rank: number;
    percentile: number;
  }>;
  average: number;
  median: number;
  best: number;
  worst: number;
};

type BenchmarkStats = {
  total_authorities: number;
  total_metrics: number;
  total_data_points: number;
  metrics_by_category: Record<string, number>;
  recent_submissions: number;
  top_performers: AuthorityBenchmark[];
};

type BenchmarkTrend = {
  metric_id: string;
  metric_name: string;
  period: string;
  trend: 'up' | 'down' | 'stable';
  change_percentage: number;
  data_points: Array<{
    period: string;
    value: number;
  }>;
};

export class BenchmarksApiService extends BaseApiService {
  constructor() {
    super('benchmark_metrics');
  }

  // Get all benchmark metrics
  async getMetrics(
    pagination?: PaginationParams,
    sort?: SortParams,
    filters?: FilterParams
  ): Promise<ApiResponse<BenchmarkMetric[]>> {
    return this.get<BenchmarkMetric>('*', filters, sort, pagination);
  }

  // Get metric by ID
  async getMetricById(id: string): Promise<ApiResponse<BenchmarkMetric>> {
    return this.getById<BenchmarkMetric>(id);
  }

  // Create a new metric
  async createMetric(metric: Omit<BenchmarkMetric, 'id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<BenchmarkMetric>> {
    return this.post<BenchmarkMetric>(metric);
  }

  // Update a metric
  async updateMetric(id: string, updates: Partial<BenchmarkMetric>): Promise<ApiResponse<BenchmarkMetric>> {
    return this.put<BenchmarkMetric>(id, updates);
  }

  // Delete a metric
  async deleteMetric(id: string): Promise<ApiResponse<boolean>> {
    return this.delete(id);
  }

  // Submit benchmark data
  async submitBenchmarkData(data: Omit<BenchmarkData, 'id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<BenchmarkData>> {
    try {
      const { data: result, error } = await supabase
        .from('benchmark_data')
        .insert(data)
        .select()
        .single();

      if (error) {
        return { data: null, error: error.message, success: false };
      }

      return { data: result as BenchmarkData, error: null, success: true };
    } catch (error: any) {
      return { data: null, error: error.message, success: false };
    }
  }

  // Get benchmark data for a specific authority
  async getAuthorityBenchmarks(
    authorityId: string,
    period?: string
  ): Promise<ApiResponse<AuthorityBenchmark>> {
    try {
      // Get authority info
      const { data: authority, error: authError } = await supabase
        .from('authorities')
        .select('id, name, region')
        .eq('id', authorityId)
        .single();

      if (authError) {
        return { data: null, error: authError.message, success: false };
      }

      // Get benchmark data for this authority
      let query = supabase
        .from('benchmark_data')
        .select(`
          *,
          metric:benchmark_metrics(*)
        `)
        .eq('authority_id', authorityId);

      if (period) {
        query = query.eq('period', period);
      }

      const { data: benchmarkData, error: dataError } = await query;

      if (dataError) {
        return { data: null, error: dataError.message, success: false };
      }

      // Calculate rankings and percentiles
      const metrics = await Promise.all(
        benchmarkData.map(async (data) => {
          const ranking = await this.getMetricRanking(data.metric_id, data.period);
          if (!ranking.success || !ranking.data) {
            return null;
          }

          const authorityRank = ranking.data.find(r => r.authority_id === authorityId);
          if (!authorityRank) {
            return null;
          }

          return {
            metric_id: data.metric_id,
            metric_name: data.metric.name,
            value: data.value,
            rank: authorityRank.rank,
            percentile: authorityRank.percentile
          };
        })
      );

      const validMetrics = metrics.filter(m => m !== null) as NonNullable<typeof metrics[0]>;

      // Calculate overall score (average percentile)
      const overallScore = validMetrics.length > 0 
        ? validMetrics.reduce((sum, metric) => sum + metric.percentile, 0) / validMetrics.length 
        : 0;

      // Get overall rank
      const overallRank = await this.getOverallRank(authorityId, period);

      const authorityBenchmark: AuthorityBenchmark = {
        authority_id: authorityId,
        authority_name: authority.name,
        region: authority.region,
        metrics: validMetrics,
        overall_score: Math.round(overallScore),
        overall_rank: overallRank.data || 0
      };

      return { data: authorityBenchmark, error: null, success: true };
    } catch (error: any) {
      return { data: null, error: error.message, success: false };
    }
  }

  // Get benchmark comparison for a specific metric
  async getMetricComparison(
    metricId: string,
    period: string
  ): Promise<ApiResponse<BenchmarkComparison>> {
    try {
      // Get metric info
      const { data: metric, error: metricError } = await supabase
        .from('benchmark_metrics')
        .select('*')
        .eq('id', metricId)
        .single();

      if (metricError) {
        return { data: null, error: metricError.message, success: false };
      }

      // Get all data for this metric and period
      const { data: benchmarkData, error: dataError } = await supabase
        .from('benchmark_data')
        .select(`
          *,
          authority:authorities(name, region)
        `)
        .eq('metric_id', metricId)
        .eq('period', period)
        .order('value', { ascending: !metric.higher_is_better });

      if (dataError) {
        return { data: null, error: dataError.message, success: false };
      }

      // Calculate statistics
      const values = benchmarkData.map(d => d.value);
      const average = values.reduce((sum, val) => sum + val, 0) / values.length;
      const sortedValues = [...values].sort((a, b) => a - b);
      const median = sortedValues[Math.floor(sortedValues.length / 2)];
      const best = metric.higher_is_better ? Math.max(...values) : Math.min(...values);
      const worst = metric.higher_is_better ? Math.min(...values) : Math.max(...values);

      // Create authorities array with rankings
      const authorities = benchmarkData.map((data, index) => ({
        authority_id: data.authority_id,
        authority_name: data.authority.name,
        value: data.value,
        rank: index + 1,
        percentile: Math.round(((benchmarkData.length - index) / benchmarkData.length) * 100)
      }));

      const comparison: BenchmarkComparison = {
        metric_id: metricId,
        metric_name: metric.name,
        unit: metric.unit,
        authorities,
        average: Math.round(average * 100) / 100,
        median: Math.round(median * 100) / 100,
        best: Math.round(best * 100) / 100,
        worst: Math.round(worst * 100) / 100
      };

      return { data: comparison, error: null, success: true };
    } catch (error: any) {
      return { data: null, error: error.message, success: false };
    }
  }

  // Get metric ranking
  async getMetricRanking(
    metricId: string,
    period: string
  ): Promise<ApiResponse<Array<{ authority_id: string; rank: number; percentile: number }>>> {
    try {
      const { data, error } = await supabase
        .from('benchmark_data')
        .select('authority_id, value')
        .eq('metric_id', metricId)
        .eq('period', period)
        .order('value', { ascending: true });

      if (error) {
        return { data: null, error: error.message, success: false };
      }

      const ranking = data.map((item, index) => ({
        authority_id: item.authority_id,
        rank: index + 1,
        percentile: Math.round(((data.length - index) / data.length) * 100)
      }));

      return { data: ranking, error: null, success: true };
    } catch (error: any) {
      return { data: null, error: error.message, success: false };
    }
  }

  // Get overall rank for an authority
  async getOverallRank(authorityId: string, period?: string): Promise<ApiResponse<number>> {
    try {
      // This would require a more complex calculation based on all metrics
      // For now, return a placeholder
      return { data: 1, error: null, success: true };
    } catch (error: any) {
      return { data: null, error: error.message, success: false };
    }
  }

  // Get benchmark statistics
  async getBenchmarkStats(): Promise<ApiResponse<BenchmarkStats>> {
    try {
      // Get total authorities count
      const { count: totalAuthorities, error: authError } = await supabase
        .from('authorities')
        .select('*', { count: 'exact', head: true });

      if (authError) {
        return { data: null, error: authError.message, success: false };
      }

      // Get total metrics count
      const { count: totalMetrics, error: metricsError } = await supabase
        .from('benchmark_metrics')
        .select('*', { count: 'exact', head: true });

      if (metricsError) {
        return { data: null, error: metricsError.message, success: false };
      }

      // Get total data points count
      const { count: totalDataPoints, error: dataError } = await supabase
        .from('benchmark_data')
        .select('*', { count: 'exact', head: true });

      if (dataError) {
        return { data: null, error: dataError.message, success: false };
      }

      // Get metrics by category
      const { data: categoryData, error: categoryError } = await supabase
        .from('benchmark_metrics')
        .select('category');

      if (categoryError) {
        return { data: null, error: categoryError.message, success: false };
      }

      const metricsByCategory = categoryData?.reduce((acc, metric) => {
        acc[metric.category] = (acc[metric.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      // Get recent submissions (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { count: recentSubmissions, error: recentError } = await supabase
        .from('benchmark_data')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', thirtyDaysAgo.toISOString());

      if (recentError) {
        return { data: null, error: recentError.message, success: false };
      }

      // Get top performers (this would need more complex logic)
      const topPerformers: AuthorityBenchmark[] = [];

      const stats: BenchmarkStats = {
        total_authorities: totalAuthorities || 0,
        total_metrics: totalMetrics || 0,
        total_data_points: totalDataPoints || 0,
        metrics_by_category: metricsByCategory,
        recent_submissions: recentSubmissions || 0,
        top_performers: topPerformers
      };

      return { data: stats, error: null, success: true };
    } catch (error: any) {
      return { data: null, error: error.message, success: false };
    }
  }

  // Get benchmark trends for a metric
  async getMetricTrends(
    metricId: string,
    periods: string[]
  ): Promise<ApiResponse<BenchmarkTrend>> {
    try {
      const { data, error } = await supabase
        .from('benchmark_data')
        .select('period, value')
        .eq('metric_id', metricId)
        .in('period', periods)
        .order('period');

      if (error) {
        return { data: null, error: error.message, success: false };
      }

      // Group by period and calculate average
      const periodData = periods.map(period => {
        const periodValues = data.filter(d => d.period === period).map(d => d.value);
        const average = periodValues.length > 0 
          ? periodValues.reduce((sum, val) => sum + val, 0) / periodValues.length 
          : 0;
        
        return {
          period,
          value: Math.round(average * 100) / 100
        };
      });

      // Calculate trend
      if (periodData.length < 2) {
        return { data: null, error: 'Insufficient data for trend analysis', success: false };
      }

      const firstValue = periodData[0].value;
      const lastValue = periodData[periodData.length - 1].value;
      const changePercentage = firstValue > 0 
        ? Math.round(((lastValue - firstValue) / firstValue) * 100) 
        : 0;

      let trend: 'up' | 'down' | 'stable' = 'stable';
      if (changePercentage > 5) trend = 'up';
      else if (changePercentage < -5) trend = 'down';

      const trendData: BenchmarkTrend = {
        metric_id: metricId,
        metric_name: '', // Would need to fetch from metric
        period: `${periods[0]} to ${periods[periods.length - 1]}`,
        trend,
        change_percentage: changePercentage,
        data_points: periodData
      };

      return { data: trendData, error: null, success: true };
    } catch (error: any) {
      return { data: null, error: error.message, success: false };
    }
  }

  // Get all authorities with their benchmark data
  async getAllAuthoritiesBenchmarks(
    period: string,
    pagination?: PaginationParams
  ): Promise<ApiResponse<AuthorityBenchmark[]>> {
    try {
      const { data: authorities, error: authError } = await supabase
        .from('authorities')
        .select('id, name, region')
        .order('name');

      if (authError) {
        return { data: null, error: authError.message, success: false };
      }

      const authoritiesBenchmarks = await Promise.all(
        authorities.map(async (authority) => {
          const benchmark = await this.getAuthorityBenchmarks(authority.id, period);
          return benchmark.data;
        })
      );

      const validBenchmarks = authoritiesBenchmarks.filter(b => b !== null) as AuthorityBenchmark[];

      return { data: validBenchmarks, error: null, success: true };
    } catch (error: any) {
      return { data: null, error: error.message, success: false };
    }
  }

  // Export benchmark data
  async exportBenchmarkData(
    metricIds: string[],
    period: string,
    format: 'csv' | 'json' = 'json'
  ): Promise<ApiResponse<string>> {
    try {
      const { data, error } = await supabase
        .from('benchmark_data')
        .select(`
          *,
          metric:benchmark_metrics(*),
          authority:authorities(name, region)
        `)
        .in('metric_id', metricIds)
        .eq('period', period);

      if (error) {
        return { data: null, error: error.message, success: false };
      }

      if (format === 'csv') {
        // Convert to CSV format
        const csvHeaders = 'Authority,Region,Metric,Value,Period';
        const csvRows = data.map(row => 
          `"${row.authority.name}","${row.authority.region}","${row.metric.name}","${row.value}","${row.period}"`
        );
        const csvContent = [csvHeaders, ...csvRows].join('\n');
        return { data: csvContent, error: null, success: true };
      } else {
        // Return as JSON string
        const jsonContent = JSON.stringify(data, null, 2);
        return { data: jsonContent, error: null, success: true };
      }
    } catch (error: any) {
      return { data: null, error: error.message, success: false };
    }
  }
}

// Export singleton instance
export const benchmarksApi = new BenchmarksApiService();
