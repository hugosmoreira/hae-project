import { BaseApiService, type ApiResponse, type PaginationParams, type SortParams, type FilterParams } from './base';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

// Type definitions
type Discussion = Database['public']['Tables']['discussions']['Row'];
type DiscussionInsert = Database['public']['Tables']['discussions']['Insert'];
type DiscussionUpdate = Database['public']['Tables']['discussions']['Update'];

type DiscussionWithAuthor = Discussion & {
  author: {
    username: string;
    role: string;
    region: string;
    avatar_url?: string;
  };
};

type DiscussionWithReplies = DiscussionWithAuthor & {
  replies: Array<{
    id: string;
    content: string;
    created_at: string;
    author: {
      username: string;
      role: string;
      region: string;
    };
  }>;
};

type DiscussionStats = {
  total_discussions: number;
  total_replies: number;
  trending_discussions: DiscussionWithAuthor[];
  recent_discussions: DiscussionWithAuthor[];
};

export class DiscussionsApiService extends BaseApiService {
  constructor() {
    super('discussions');
  }

  // Get all discussions with author information
  async getAllDiscussions(
    pagination?: PaginationParams,
    sort?: SortParams,
    filters?: FilterParams
  ): Promise<ApiResponse<DiscussionWithAuthor[]>> {
    const selectQuery = `
      *,
      author:profiles!discussions_author_id_fkey(
        username,
        role,
        region,
        avatar_url
      )
    `;

    return this.get<DiscussionWithAuthor>(selectQuery, filters, sort, pagination);
  }

  // Get discussion by ID with full details including replies
  async getDiscussionById(id: string): Promise<ApiResponse<DiscussionWithReplies>> {
    try {
      const { data, error } = await supabase
        .from('discussions')
        .select(`
          *,
          author:profiles!discussions_author_id_fkey(
            username,
            role,
            region,
            avatar_url
          ),
          replies:discussion_replies(
            id,
            content,
            created_at,
            author:profiles!discussion_replies_author_id_fkey(
              username,
              role,
              region
            )
          )
        `)
        .eq('id', id)
        .single();

      if (error) {
        return { data: null, error: error.message, success: false };
      }

      return { data: data as DiscussionWithReplies, error: null, success: true };
    } catch (error: any) {
      return { data: null, error: error.message, success: false };
    }
  }

  // Create a new discussion
  async createDiscussion(discussion: DiscussionInsert): Promise<ApiResponse<DiscussionWithAuthor>> {
    const selectQuery = `
      *,
      author:profiles!discussions_author_id_fkey(
        username,
        role,
        region,
        avatar_url
      )
    `;

    return this.post<DiscussionWithAuthor>(discussion, selectQuery);
  }

  // Update a discussion
  async updateDiscussion(id: string, updates: DiscussionUpdate): Promise<ApiResponse<DiscussionWithAuthor>> {
    const selectQuery = `
      *,
      author:profiles!discussions_author_id_fkey(
        username,
        role,
        region,
        avatar_url
      )
    `;

    return this.put<DiscussionWithAuthor>(id, updates, selectQuery);
  }

  // Delete a discussion
  async deleteDiscussion(id: string): Promise<ApiResponse<boolean>> {
    return this.delete(id);
  }

  // Search discussions
  async searchDiscussions(
    searchTerm: string,
    pagination?: PaginationParams,
    filters?: FilterParams
  ): Promise<ApiResponse<DiscussionWithAuthor[]>> {
    const selectQuery = `
      *,
      author:profiles!discussions_author_id_fkey(
        username,
        role,
        region,
        avatar_url
      )
    `;

    return this.search<DiscussionWithAuthor>(
      searchTerm,
      ['title', 'content'],
      selectQuery,
      filters
    );
  }

  // Get discussions by category
  async getDiscussionsByCategory(
    category: string,
    pagination?: PaginationParams,
    sort?: SortParams
  ): Promise<ApiResponse<DiscussionWithAuthor[]>> {
    return this.getAllDiscussions(pagination, sort, { category });
  }

  // Get trending discussions (most liked/replied to)
  async getTrendingDiscussions(limit: number = 5): Promise<ApiResponse<DiscussionWithAuthor[]>> {
    try {
      const { data, error } = await supabase
        .from('discussions')
        .select(`
          *,
          author:profiles!discussions_author_id_fkey(
            username,
            role,
            region,
            avatar_url
          )
        `)
        .order('likes_count', { ascending: false })
        .order('replies_count', { ascending: false })
        .limit(limit);

      if (error) {
        return { data: null, error: error.message, success: false };
      }

      return { data: data as DiscussionWithAuthor[], error: null, success: true };
    } catch (error: any) {
      return { data: null, error: error.message, success: false };
    }
  }

  // Get recent discussions
  async getRecentDiscussions(limit: number = 10): Promise<ApiResponse<DiscussionWithAuthor[]>> {
    return this.getAllDiscussions(
      { limit },
      { column: 'created_at', ascending: false }
    );
  }

  // Get discussion statistics
  async getDiscussionStats(): Promise<ApiResponse<DiscussionStats>> {
    try {
      // Get total discussions count
      const { count: totalDiscussions, error: countError } = await supabase
        .from('discussions')
        .select('*', { count: 'exact', head: true });

      if (countError) {
        return { data: null, error: countError.message, success: false };
      }

      // Get total replies count
      const { count: totalReplies, error: repliesError } = await supabase
        .from('discussion_replies')
        .select('*', { count: 'exact', head: true });

      if (repliesError) {
        return { data: null, error: repliesError.message, success: false };
      }

      // Get trending discussions
      const trendingResult = await this.getTrendingDiscussions(3);
      if (!trendingResult.success) {
        return trendingResult;
      }

      // Get recent discussions
      const recentResult = await this.getRecentDiscussions(5);
      if (!recentResult.success) {
        return recentResult;
      }

      const stats: DiscussionStats = {
        total_discussions: totalDiscussions || 0,
        total_replies: totalReplies || 0,
        trending_discussions: trendingResult.data || [],
        recent_discussions: recentResult.data || []
      };

      return { data: stats, error: null, success: true };
    } catch (error: any) {
      return { data: null, error: error.message, success: false };
    }
  }

  // Like a discussion
  async likeDiscussion(discussionId: string, userId: string): Promise<ApiResponse<boolean>> {
    try {
      // Check if user already liked this discussion
      const { data: existingLike } = await supabase
        .from('discussion_likes')
        .select('id')
        .eq('discussion_id', discussionId)
        .eq('user_id', userId)
        .single();

      if (existingLike) {
        return { data: null, error: 'Discussion already liked', success: false };
      }

      // Add like
      const { error: likeError } = await supabase
        .from('discussion_likes')
        .insert({
          discussion_id: discussionId,
          user_id: userId
        });

      if (likeError) {
        return { data: null, error: likeError.message, success: false };
      }

      // Update likes count
      const { error: updateError } = await supabase
        .from('discussions')
        .update({ likes_count: supabase.raw('likes_count + 1') })
        .eq('id', discussionId);

      if (updateError) {
        return { data: null, error: updateError.message, success: false };
      }

      return { data: true, error: null, success: true };
    } catch (error: any) {
      return { data: null, error: error.message, success: false };
    }
  }

  // Unlike a discussion
  async unlikeDiscussion(discussionId: string, userId: string): Promise<ApiResponse<boolean>> {
    try {
      // Remove like
      const { error: unlikeError } = await supabase
        .from('discussion_likes')
        .delete()
        .eq('discussion_id', discussionId)
        .eq('user_id', userId);

      if (unlikeError) {
        return { data: null, error: unlikeError.message, success: false };
      }

      // Update likes count
      const { error: updateError } = await supabase
        .from('discussions')
        .update({ likes_count: supabase.raw('likes_count - 1') })
        .eq('id', discussionId);

      if (updateError) {
        return { data: null, error: updateError.message, success: false };
      }

      return { data: true, error: null, success: true };
    } catch (error: any) {
      return { data: null, error: error.message, success: false };
    }
  }

  // Get user's discussions
  async getUserDiscussions(
    userId: string,
    pagination?: PaginationParams
  ): Promise<ApiResponse<DiscussionWithAuthor[]>> {
    return this.getAllDiscussions(pagination, { column: 'created_at', ascending: false }, { author_id: userId });
  }

  // Get discussions by tags
  async getDiscussionsByTags(
    tags: string[],
    pagination?: PaginationParams
  ): Promise<ApiResponse<DiscussionWithAuthor[]>> {
    try {
      const { data, error } = await supabase
        .from('discussions')
        .select(`
          *,
          author:profiles!discussions_author_id_fkey(
            username,
            role,
            region,
            avatar_url
          )
        `)
        .overlaps('tags', tags)
        .order('created_at', { ascending: false });

      if (error) {
        return { data: null, error: error.message, success: false };
      }

      return { data: data as DiscussionWithAuthor[], error: null, success: true };
    } catch (error: any) {
      return { data: null, error: error.message, success: false };
    }
  }
}

// Export singleton instance
export const discussionsApi = new DiscussionsApiService();
