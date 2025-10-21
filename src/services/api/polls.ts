import { BaseApiService, type ApiResponse, type PaginationParams, type SortParams, type FilterParams } from './base';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

// Type definitions
type Poll = Database['public']['Tables']['polls']['Row'];
type PollInsert = Database['public']['Tables']['polls']['Insert'];
type PollUpdate = Database['public']['Tables']['polls']['Update'];

type PollOption = Database['public']['Tables']['poll_options']['Row'];
type PollOptionInsert = Database['public']['Tables']['poll_options']['Insert'];

type PollVote = Database['public']['Tables']['poll_votes']['Row'];
type PollVoteInsert = Database['public']['Tables']['poll_votes']['Insert'];

type PollWithOptions = Poll & {
  options: PollOption[];
  author: {
    username: string;
    role: string;
    region: string;
  };
  user_has_voted?: boolean;
  user_vote_option_id?: string;
};

type PollStats = {
  total_polls: number;
  active_polls: number;
  total_votes: number;
  polls_by_category: Record<string, number>;
  popular_polls: PollWithOptions[];
  recent_polls: PollWithOptions[];
};

type PollResults = {
  poll: PollWithOptions;
  results: Array<{
    option_id: string;
    option_text: string;
    vote_count: number;
    percentage: number;
  }>;
  total_votes: number;
  user_vote?: string;
};

export class PollsApiService extends BaseApiService {
  constructor() {
    super('polls');
  }

  // Get all polls with options and author information
  async getAllPolls(
    pagination?: PaginationParams,
    sort?: SortParams,
    filters?: FilterParams
  ): Promise<ApiResponse<PollWithOptions[]>> {
    try {
      const { data, error } = await supabase
        .from('polls')
        .select(`
          *,
          author:profiles!polls_author_id_fkey(
            username,
            role,
            region
          ),
          options:poll_options(*)
        `)
        .order(sort?.column || 'created_at', { ascending: sort?.ascending ?? false });

      if (error) {
        return { data: null, error: error.message, success: false };
      }

      return { data: data as PollWithOptions[], error: null, success: true };
    } catch (error: any) {
      return { data: null, error: error.message, success: false };
    }
  }

  // Get poll by ID with full details
  async getPollById(id: string, userId?: string): Promise<ApiResponse<PollWithOptions>> {
    try {
      const { data, error } = await supabase
        .from('polls')
        .select(`
          *,
          author:profiles!polls_author_id_fkey(
            username,
            role,
            region
          ),
          options:poll_options(*)
        `)
        .eq('id', id)
        .single();

      if (error) {
        return { data: null, error: error.message, success: false };
      }

      // Check if user has voted (if userId provided)
      if (userId) {
        const { data: userVote } = await supabase
          .from('poll_votes')
          .select('option_id')
          .eq('poll_id', id)
          .eq('user_id', userId)
          .single();

        if (userVote) {
          (data as PollWithOptions).user_has_voted = true;
          (data as PollWithOptions).user_vote_option_id = userVote.option_id;
        }
      }

      return { data: data as PollWithOptions, error: null, success: true };
    } catch (error: any) {
      return { data: null, error: error.message, success: false };
    }
  }

  // Create a new poll with options
  async createPoll(
    poll: PollInsert,
    options: Omit<PollOptionInsert, 'poll_id'>[]
  ): Promise<ApiResponse<PollWithOptions>> {
    try {
      // Start a transaction
      const { data: newPoll, error: pollError } = await supabase
        .from('polls')
        .insert(poll)
        .select()
        .single();

      if (pollError) {
        return { data: null, error: pollError.message, success: false };
      }

      // Insert poll options
      const optionsWithPollId = options.map(option => ({
        ...option,
        poll_id: newPoll.id
      }));

      const { error: optionsError } = await supabase
        .from('poll_options')
        .insert(optionsWithPollId);

      if (optionsError) {
        // Rollback poll creation
        await supabase.from('polls').delete().eq('id', newPoll.id);
        return { data: null, error: optionsError.message, success: false };
      }

      // Fetch the complete poll with options
      const completePoll = await this.getPollById(newPoll.id);
      return completePoll;
    } catch (error: any) {
      return { data: null, error: error.message, success: false };
    }
  }

  // Update a poll
  async updatePoll(id: string, updates: PollUpdate): Promise<ApiResponse<PollWithOptions>> {
    try {
      const { data, error } = await supabase
        .from('polls')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          author:profiles!polls_author_id_fkey(
            username,
            role,
            region
          ),
          options:poll_options(*)
        `)
        .single();

      if (error) {
        return { data: null, error: error.message, success: false };
      }

      return { data: data as PollWithOptions, error: null, success: true };
    } catch (error: any) {
      return { data: null, error: error.message, success: false };
    }
  }

  // Delete a poll
  async deletePoll(id: string): Promise<ApiResponse<boolean>> {
    return this.delete(id);
  }

  // Vote on a poll
  async voteOnPoll(pollId: string, optionId: string, userId: string): Promise<ApiResponse<boolean>> {
    try {
      // Check if user already voted
      const { data: existingVote } = await supabase
        .from('poll_votes')
        .select('id')
        .eq('poll_id', pollId)
        .eq('user_id', userId)
        .single();

      if (existingVote) {
        return { data: null, error: 'You have already voted on this poll', success: false };
      }

      // Check if poll is still active
      const { data: poll, error: pollError } = await supabase
        .from('polls')
        .select('expires_at')
        .eq('id', pollId)
        .single();

      if (pollError) {
        return { data: null, error: pollError.message, success: false };
      }

      if (new Date(poll.expires_at) < new Date()) {
        return { data: null, error: 'This poll has expired', success: false };
      }

      // Insert vote
      const { error: voteError } = await supabase
        .from('poll_votes')
        .insert({
          poll_id: pollId,
          option_id: optionId,
          user_id: userId
        });

      if (voteError) {
        return { data: null, error: voteError.message, success: false };
      }

      // Update vote counts
      const { error: optionUpdateError } = await supabase
        .from('poll_options')
        .update({ vote_count: supabase.raw('vote_count + 1') })
        .eq('id', optionId);

      if (optionUpdateError) {
        return { data: null, error: optionUpdateError.message, success: false };
      }

      const { error: pollUpdateError } = await supabase
        .from('polls')
        .update({ total_votes: supabase.raw('total_votes + 1') })
        .eq('id', pollId);

      if (pollUpdateError) {
        return { data: null, error: pollUpdateError.message, success: false };
      }

      return { data: true, error: null, success: true };
    } catch (error: any) {
      return { data: null, error: error.message, success: false };
    }
  }

  // Get poll results
  async getPollResults(pollId: string, userId?: string): Promise<ApiResponse<PollResults>> {
    try {
      const pollResult = await this.getPollById(pollId, userId);
      if (!pollResult.success || !pollResult.data) {
        return pollResult;
      }

      const poll = pollResult.data;
      const totalVotes = poll.total_votes;

      const results = poll.options.map(option => ({
        option_id: option.id,
        option_text: option.option_text,
        vote_count: option.vote_count,
        percentage: totalVotes > 0 ? Math.round((option.vote_count / totalVotes) * 100) : 0
      }));

      const pollResults: PollResults = {
        poll,
        results,
        total_votes: totalVotes,
        user_vote: poll.user_vote_option_id
      };

      return { data: pollResults, error: null, success: true };
    } catch (error: any) {
      return { data: null, error: error.message, success: false };
    }
  }

  // Get active polls
  async getActivePolls(limit?: number): Promise<ApiResponse<PollWithOptions[]>> {
    try {
      const { data, error } = await supabase
        .from('polls')
        .select(`
          *,
          author:profiles!polls_author_id_fkey(
            username,
            role,
            region
          ),
          options:poll_options(*)
        `)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(limit || 50);

      if (error) {
        return { data: null, error: error.message, success: false };
      }

      return { data: data as PollWithOptions[], error: null, success: true };
    } catch (error: any) {
      return { data: null, error: error.message, success: false };
    }
  }

  // Get expired polls
  async getExpiredPolls(limit?: number): Promise<ApiResponse<PollWithOptions[]>> {
    try {
      const { data, error } = await supabase
        .from('polls')
        .select(`
          *,
          author:profiles!polls_author_id_fkey(
            username,
            role,
            region
          ),
          options:poll_options(*)
        `)
        .lt('expires_at', new Date().toISOString())
        .order('expires_at', { ascending: false })
        .limit(limit || 50);

      if (error) {
        return { data: null, error: error.message, success: false };
      }

      return { data: data as PollWithOptions[], error: null, success: true };
    } catch (error: any) {
      return { data: null, error: error.message, success: false };
    }
  }

  // Get polls by author
  async getPollsByAuthor(
    authorId: string,
    pagination?: PaginationParams
  ): Promise<ApiResponse<PollWithOptions[]>> {
    return this.getAllPolls(
      pagination,
      { column: 'created_at', ascending: false },
      { author_id: authorId }
    );
  }

  // Get user's votes
  async getUserVotes(userId: string): Promise<ApiResponse<PollVote[]>> {
    try {
      const { data, error } = await supabase
        .from('poll_votes')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        return { data: null, error: error.message, success: false };
      }

      return { data: data as PollVote[], error: null, success: true };
    } catch (error: any) {
      return { data: null, error: error.message, success: false };
    }
  }

  // Get poll statistics
  async getPollStats(): Promise<ApiResponse<PollStats>> {
    try {
      // Get total polls count
      const { count: totalPolls, error: countError } = await supabase
        .from('polls')
        .select('*', { count: 'exact', head: true });

      if (countError) {
        return { data: null, error: countError.message, success: false };
      }

      // Get active polls count
      const { count: activePolls, error: activeError } = await supabase
        .from('polls')
        .select('*', { count: 'exact', head: true })
        .gt('expires_at', new Date().toISOString());

      if (activeError) {
        return { data: null, error: activeError.message, success: false };
      }

      // Get total votes count
      const { count: totalVotes, error: votesError } = await supabase
        .from('poll_votes')
        .select('*', { count: 'exact', head: true });

      if (votesError) {
        return { data: null, error: votesError.message, success: false };
      }

      // Get polls by category (if category field exists)
      const { data: categoryData, error: categoryError } = await supabase
        .from('polls')
        .select('category');

      if (categoryError) {
        return { data: null, error: categoryError.message, success: false };
      }

      const pollsByCategory = categoryData?.reduce((acc, poll) => {
        const category = poll.category || 'General';
        acc[category] = (acc[category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      // Get popular polls
      const { data: popularPolls, error: popularError } = await supabase
        .from('polls')
        .select(`
          *,
          author:profiles!polls_author_id_fkey(
            username,
            role,
            region
          ),
          options:poll_options(*)
        `)
        .order('total_votes', { ascending: false })
        .limit(5);

      if (popularError) {
        return { data: null, error: popularError.message, success: false };
      }

      // Get recent polls
      const { data: recentPolls, error: recentError } = await supabase
        .from('polls')
        .select(`
          *,
          author:profiles!polls_author_id_fkey(
            username,
            role,
            region
          ),
          options:poll_options(*)
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      if (recentError) {
        return { data: null, error: recentError.message, success: false };
      }

      const stats: PollStats = {
        total_polls: totalPolls || 0,
        active_polls: activePolls || 0,
        total_votes: totalVotes || 0,
        polls_by_category: pollsByCategory,
        popular_polls: popularPolls as PollWithOptions[] || [],
        recent_polls: recentPolls as PollWithOptions[] || []
      };

      return { data: stats, error: null, success: true };
    } catch (error: any) {
      return { data: null, error: error.message, success: false };
    }
  }

  // Check if user can vote on poll
  async canUserVote(pollId: string, userId: string): Promise<ApiResponse<boolean>> {
    try {
      // Check if poll exists and is active
      const { data: poll, error: pollError } = await supabase
        .from('polls')
        .select('expires_at')
        .eq('id', pollId)
        .single();

      if (pollError || !poll) {
        return { data: false, error: 'Poll not found', success: false };
      }

      if (new Date(poll.expires_at) < new Date()) {
        return { data: false, error: 'Poll has expired', success: false };
      }

      // Check if user already voted
      const { data: existingVote } = await supabase
        .from('poll_votes')
        .select('id')
        .eq('poll_id', pollId)
        .eq('user_id', userId)
        .single();

      if (existingVote) {
        return { data: false, error: 'User has already voted', success: false };
      }

      return { data: true, error: null, success: true };
    } catch (error: any) {
      return { data: null, error: error.message, success: false };
    }
  }
}

// Export singleton instance
export const pollsApi = new PollsApiService();
