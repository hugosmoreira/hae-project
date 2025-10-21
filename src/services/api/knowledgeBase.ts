import { BaseApiService, type ApiResponse, type PaginationParams, type SortParams, type FilterParams } from './base';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

// Type definitions
type KnowledgeArticle = Database['public']['Tables']['knowledge_articles']['Row'];
type KnowledgeArticleInsert = Database['public']['Tables']['knowledge_articles']['Insert'];
type KnowledgeArticleUpdate = Database['public']['Tables']['knowledge_articles']['Update'];

type KnowledgeArticleWithAuthor = KnowledgeArticle & {
  author: {
    username: string;
    role: string;
    region: string;
    avatar_url?: string;
  };
};

type KnowledgeArticleStats = {
  total_articles: number;
  total_helpful_votes: number;
  articles_by_category: Record<string, number>;
  popular_articles: KnowledgeArticleWithAuthor[];
  recent_articles: KnowledgeArticleWithAuthor[];
};

type CategoryStats = {
  category: string;
  count: number;
  helpful_count: number;
};

export class KnowledgeBaseApiService extends BaseApiService {
  constructor() {
    super('knowledge_articles');
  }

  // Get all knowledge articles with author information
  async getAllArticles(
    pagination?: PaginationParams,
    sort?: SortParams,
    filters?: FilterParams
  ): Promise<ApiResponse<KnowledgeArticleWithAuthor[]>> {
    const selectQuery = `
      *,
      author:profiles!knowledge_articles_author_id_fkey(
        username,
        role,
        region,
        avatar_url
      )
    `;

    return this.get<KnowledgeArticleWithAuthor>(selectQuery, filters, sort, pagination);
  }

  // Get article by ID with author information
  async getArticleById(id: string): Promise<ApiResponse<KnowledgeArticleWithAuthor>> {
    const selectQuery = `
      *,
      author:profiles!knowledge_articles_author_id_fkey(
        username,
        role,
        region,
        avatar_url
      )
    `;

    return this.getById<KnowledgeArticleWithAuthor>(id, selectQuery);
  }

  // Get article by slug
  async getArticleBySlug(slug: string): Promise<ApiResponse<KnowledgeArticleWithAuthor>> {
    try {
      const { data, error } = await supabase
        .from('knowledge_articles')
        .select(`
          *,
          author:profiles!knowledge_articles_author_id_fkey(
            username,
            role,
            region,
            avatar_url
          )
        `)
        .eq('slug', slug)
        .single();

      if (error) {
        return { data: null, error: error.message, success: false };
      }

      return { data: data as KnowledgeArticleWithAuthor, error: null, success: true };
    } catch (error: any) {
      return { data: null, error: error.message, success: false };
    }
  }

  // Create a new article
  async createArticle(article: KnowledgeArticleInsert): Promise<ApiResponse<KnowledgeArticleWithAuthor>> {
    const selectQuery = `
      *,
      author:profiles!knowledge_articles_author_id_fkey(
        username,
        role,
        region,
        avatar_url
      )
    `;

    return this.post<KnowledgeArticleWithAuthor>(article, selectQuery);
  }

  // Update an article
  async updateArticle(id: string, updates: KnowledgeArticleUpdate): Promise<ApiResponse<KnowledgeArticleWithAuthor>> {
    const selectQuery = `
      *,
      author:profiles!knowledge_articles_author_id_fkey(
        username,
        role,
        region,
        avatar_url
      )
    `;

    return this.put<KnowledgeArticleWithAuthor>(id, updates, selectQuery);
  }

  // Delete an article
  async deleteArticle(id: string): Promise<ApiResponse<boolean>> {
    return this.delete(id);
  }

  // Search articles
  async searchArticles(
    searchTerm: string,
    pagination?: PaginationParams,
    filters?: FilterParams
  ): Promise<ApiResponse<KnowledgeArticleWithAuthor[]>> {
    const selectQuery = `
      *,
      author:profiles!knowledge_articles_author_id_fkey(
        username,
        role,
        region,
        avatar_url
      )
    `;

    return this.search<KnowledgeArticleWithAuthor>(
      searchTerm,
      ['title', 'description', 'content'],
      selectQuery,
      filters
    );
  }

  // Get articles by category
  async getArticlesByCategory(
    category: string,
    pagination?: PaginationParams,
    sort?: SortParams
  ): Promise<ApiResponse<KnowledgeArticleWithAuthor[]>> {
    return this.getAllArticles(pagination, sort, { category });
  }

  // Get popular articles (most helpful)
  async getPopularArticles(limit: number = 10): Promise<ApiResponse<KnowledgeArticleWithAuthor[]>> {
    try {
      const { data, error } = await supabase
        .from('knowledge_articles')
        .select(`
          *,
          author:profiles!knowledge_articles_author_id_fkey(
            username,
            role,
            region,
            avatar_url
          )
        `)
        .order('helpful_count', { ascending: false })
        .limit(limit);

      if (error) {
        return { data: null, error: error.message, success: false };
      }

      return { data: data as KnowledgeArticleWithAuthor[], error: null, success: true };
    } catch (error: any) {
      return { data: null, error: error.message, success: false };
    }
  }

  // Get recent articles
  async getRecentArticles(limit: number = 10): Promise<ApiResponse<KnowledgeArticleWithAuthor[]>> {
    return this.getAllArticles(
      { limit },
      { column: 'created_at', ascending: false }
    );
  }

  // Get articles by author
  async getArticlesByAuthor(
    authorId: string,
    pagination?: PaginationParams
  ): Promise<ApiResponse<KnowledgeArticleWithAuthor[]>> {
    return this.getAllArticles(
      pagination,
      { column: 'created_at', ascending: false },
      { author_id: authorId }
    );
  }

  // Mark article as helpful
  async markAsHelpful(articleId: string, userId: string): Promise<ApiResponse<boolean>> {
    try {
      // Check if user already marked this article as helpful
      const { data: existingVote } = await supabase
        .from('article_helpful_votes')
        .select('id')
        .eq('article_id', articleId)
        .eq('user_id', userId)
        .single();

      if (existingVote) {
        return { data: null, error: 'Article already marked as helpful', success: false };
      }

      // Add helpful vote
      const { error: voteError } = await supabase
        .from('article_helpful_votes')
        .insert({
          article_id: articleId,
          user_id: userId
        });

      if (voteError) {
        return { data: null, error: voteError.message, success: false };
      }

      // Update helpful count
      const { error: updateError } = await supabase
        .from('knowledge_articles')
        .update({ helpful_count: supabase.raw('helpful_count + 1') })
        .eq('id', articleId);

      if (updateError) {
        return { data: null, error: updateError.message, success: false };
      }

      return { data: true, error: null, success: true };
    } catch (error: any) {
      return { data: null, error: error.message, success: false };
    }
  }

  // Remove helpful vote
  async removeHelpfulVote(articleId: string, userId: string): Promise<ApiResponse<boolean>> {
    try {
      // Remove helpful vote
      const { error: removeError } = await supabase
        .from('article_helpful_votes')
        .delete()
        .eq('article_id', articleId)
        .eq('user_id', userId);

      if (removeError) {
        return { data: null, error: removeError.message, success: false };
      }

      // Update helpful count
      const { error: updateError } = await supabase
        .from('knowledge_articles')
        .update({ helpful_count: supabase.raw('helpful_count - 1') })
        .eq('id', articleId);

      if (updateError) {
        return { data: null, error: updateError.message, success: false };
      }

      return { data: true, error: null, success: true };
    } catch (error: any) {
      return { data: null, error: error.message, success: false };
    }
  }

  // Get article statistics
  async getArticleStats(): Promise<ApiResponse<KnowledgeArticleStats>> {
    try {
      // Get total articles count
      const { count: totalArticles, error: countError } = await supabase
        .from('knowledge_articles')
        .select('*', { count: 'exact', head: true });

      if (countError) {
        return { data: null, error: countError.message, success: false };
      }

      // Get total helpful votes
      const { count: totalHelpful, error: helpfulError } = await supabase
        .from('article_helpful_votes')
        .select('*', { count: 'exact', head: true });

      if (helpfulError) {
        return { data: null, error: helpfulError.message, success: false };
      }

      // Get articles by category
      const { data: categoryData, error: categoryError } = await supabase
        .from('knowledge_articles')
        .select('category, helpful_count');

      if (categoryError) {
        return { data: null, error: categoryError.message, success: false };
      }

      const articlesByCategory = categoryData?.reduce((acc, article) => {
        acc[article.category] = (acc[article.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      // Get popular articles
      const popularResult = await this.getPopularArticles(5);
      if (!popularResult.success) {
        return popularResult;
      }

      // Get recent articles
      const recentResult = await this.getRecentArticles(5);
      if (!recentResult.success) {
        return recentResult;
      }

      const stats: KnowledgeArticleStats = {
        total_articles: totalArticles || 0,
        total_helpful_votes: totalHelpful || 0,
        articles_by_category: articlesByCategory,
        popular_articles: popularResult.data || [],
        recent_articles: recentResult.data || []
      };

      return { data: stats, error: null, success: true };
    } catch (error: any) {
      return { data: null, error: error.message, success: false };
    }
  }

  // Get category statistics
  async getCategoryStats(): Promise<ApiResponse<CategoryStats[]>> {
    try {
      const { data, error } = await supabase
        .from('knowledge_articles')
        .select('category, helpful_count')
        .order('category');

      if (error) {
        return { data: null, error: error.message, success: false };
      }

      const categoryStats = data?.reduce((acc, article) => {
        const existing = acc.find(item => item.category === article.category);
        if (existing) {
          existing.count += 1;
          existing.helpful_count += article.helpful_count;
        } else {
          acc.push({
            category: article.category,
            count: 1,
            helpful_count: article.helpful_count
          });
        }
        return acc;
      }, [] as CategoryStats[]) || [];

      return { data: categoryStats, error: null, success: true };
    } catch (error: any) {
      return { data: null, error: error.message, success: false };
    }
  }

  // Get related articles
  async getRelatedArticles(
    articleId: string,
    limit: number = 5
  ): Promise<ApiResponse<KnowledgeArticleWithAuthor[]>> {
    try {
      // First get the current article to find its category
      const { data: currentArticle, error: currentError } = await supabase
        .from('knowledge_articles')
        .select('category')
        .eq('id', articleId)
        .single();

      if (currentError) {
        return { data: null, error: currentError.message, success: false };
      }

      // Get related articles from the same category
      const { data, error } = await supabase
        .from('knowledge_articles')
        .select(`
          *,
          author:profiles!knowledge_articles_author_id_fkey(
            username,
            role,
            region,
            avatar_url
          )
        `)
        .eq('category', currentArticle.category)
        .neq('id', articleId)
        .order('helpful_count', { ascending: false })
        .limit(limit);

      if (error) {
        return { data: null, error: error.message, success: false };
      }

      return { data: data as KnowledgeArticleWithAuthor[], error: null, success: true };
    } catch (error: any) {
      return { data: null, error: error.message, success: false };
    }
  }

  // Generate unique slug from title
  async generateSlug(title: string): Promise<string> {
    const baseSlug = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();

    let slug = baseSlug;
    let counter = 1;

    while (true) {
      const { data } = await supabase
        .from('knowledge_articles')
        .select('id')
        .eq('slug', slug)
        .single();

      if (!data) {
        return slug;
      }

      slug = `${baseSlug}-${counter}`;
      counter++;
    }
  }
}

// Export singleton instance
export const knowledgeBaseApi = new KnowledgeBaseApiService();
