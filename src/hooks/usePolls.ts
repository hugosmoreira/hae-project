import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { pollsApi } from '@/services/api';
import { usePollsLoadingStates } from './useLoadingStates';
import type { 
  PollWithOptions, 
  PollResults,
  PollStats,
  PaginationParams,
  SortParams,
  FilterParams
} from '@/services/api';

// Hook for getting all polls
export function usePolls(
  pagination?: PaginationParams,
  sort?: SortParams,
  filters?: FilterParams
) {
  return useQuery({
    queryKey: ['polls', pagination, sort, filters],
    queryFn: () => pollsApi.getAllPolls(pagination, sort, filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
}

// Hook for getting a single poll by ID
export function usePoll(id: string, userId?: string) {
  return useQuery({
    queryKey: ['poll', id, userId],
    queryFn: () => pollsApi.getPollById(id, userId),
    enabled: !!id,
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 2,
  });
}

// Hook for getting active polls
export function useActivePolls(limit?: number) {
  return useQuery({
    queryKey: ['polls', 'active', limit],
    queryFn: () => pollsApi.getActivePolls(limit),
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 2,
  });
}

// Hook for getting expired polls
export function useExpiredPolls(limit?: number) {
  return useQuery({
    queryKey: ['polls', 'expired', limit],
    queryFn: () => pollsApi.getExpiredPolls(limit),
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
  });
}

// Hook for getting polls by author
export function usePollsByAuthor(
  authorId: string,
  pagination?: PaginationParams
) {
  return useQuery({
    queryKey: ['polls', 'author', authorId, pagination],
    queryFn: () => pollsApi.getPollsByAuthor(authorId, pagination),
    enabled: !!authorId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
}

// Hook for getting user's votes
export function useUserVotes(userId: string) {
  return useQuery({
    queryKey: ['polls', 'user-votes', userId],
    queryFn: () => pollsApi.getUserVotes(userId),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
}

// Hook for getting poll results
export function usePollResults(pollId: string, userId?: string) {
  return useQuery({
    queryKey: ['poll-results', pollId, userId],
    queryFn: () => pollsApi.getPollResults(pollId, userId),
    enabled: !!pollId,
    staleTime: 1 * 60 * 1000, // 1 minute
    retry: 2,
  });
}

// Hook for getting poll statistics
export function usePollStats() {
  return useQuery({
    queryKey: ['polls', 'stats'],
    queryFn: () => pollsApi.getPollStats(),
    staleTime: 15 * 60 * 1000, // 15 minutes
    retry: 2,
  });
}

// Hook for checking if user can vote
export function useCanUserVote(pollId: string, userId: string) {
  return useQuery({
    queryKey: ['polls', 'can-vote', pollId, userId],
    queryFn: () => pollsApi.canUserVote(pollId, userId),
    enabled: !!pollId && !!userId,
    staleTime: 30 * 1000, // 30 seconds
    retry: 1,
  });
}

// Hook for creating a poll
export function useCreatePoll() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ poll, options }: { poll: any; options: any[] }) =>
      pollsApi.createPoll(poll, options),
    onSuccess: () => {
      // Invalidate and refetch polls
      queryClient.invalidateQueries({ queryKey: ['polls'] });
      queryClient.invalidateQueries({ queryKey: ['polls', 'stats'] });
    },
  });
}

// Hook for updating a poll
export function useUpdatePoll() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: any }) =>
      pollsApi.updatePoll(id, updates),
    onSuccess: (_, { id }) => {
      // Invalidate specific poll and all polls
      queryClient.invalidateQueries({ queryKey: ['poll', id] });
      queryClient.invalidateQueries({ queryKey: ['polls'] });
    },
  });
}

// Hook for deleting a poll
export function useDeletePoll() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: pollsApi.deletePoll,
    onSuccess: () => {
      // Invalidate all polls
      queryClient.invalidateQueries({ queryKey: ['polls'] });
      queryClient.invalidateQueries({ queryKey: ['polls', 'stats'] });
    },
  });
}

// Hook for voting on a poll
export function useVoteOnPoll() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ pollId, optionId, userId }: { pollId: string; optionId: string; userId: string }) =>
      pollsApi.voteOnPoll(pollId, optionId, userId),
    onSuccess: (_, { pollId }) => {
      // Invalidate specific poll, results, and user votes
      queryClient.invalidateQueries({ queryKey: ['poll', pollId] });
      queryClient.invalidateQueries({ queryKey: ['poll-results', pollId] });
      queryClient.invalidateQueries({ queryKey: ['polls', 'user-votes'] });
      queryClient.invalidateQueries({ queryKey: ['polls', 'can-vote', pollId] });
    },
  });
}

// Combined hook for poll operations
export function usePollsData() {
  const polls = usePolls();
  const active = useActivePolls();
  const stats = usePollStats();

  return {
    polls,
    active,
    stats,
    isLoading: polls.isLoading || active.isLoading || stats.isLoading,
    error: polls.error || active.error || stats.error,
  };
}

// Hook for poll management (create, update, delete)
export function usePollManagement() {
  const createPoll = useCreatePoll();
  const updatePoll = useUpdatePoll();
  const deletePoll = useDeletePoll();

  return {
    createPoll,
    updatePoll,
    deletePoll,
    isLoading: createPoll.isPending || updatePoll.isPending || deletePoll.isPending,
    error: createPoll.error || updatePoll.error || deletePoll.error,
  };
}

// Hook for poll voting operations
export function usePollVoting() {
  const voteOnPoll = useVoteOnPoll();

  return {
    voteOnPoll,
    isVoting: voteOnPoll.isPending,
    error: voteOnPoll.error,
  };
}

// Hook for getting poll with results
export function usePollWithResults(pollId: string, userId?: string) {
  const poll = usePoll(pollId, userId);
  const results = usePollResults(pollId, userId);
  const canVote = useCanUserVote(pollId, userId || '');

  return {
    poll,
    results,
    canVote,
    isLoading: poll.isLoading || results.isLoading || canVote.isLoading,
    error: poll.error || results.error || canVote.error,
  };
}

// Hook for user's poll activity
export function useUserPollActivity(userId: string) {
  const userPolls = usePollsByAuthor(userId);
  const userVotes = useUserVotes(userId);

  return {
    userPolls,
    userVotes,
    isLoading: userPolls.isLoading || userVotes.isLoading,
    error: userPolls.error || userVotes.error,
  };
}

// Enhanced hook with loading states and UI components
export function usePollsWithLoading(
  pagination?: PaginationParams,
  sort?: SortParams,
  filters?: FilterParams,
  config?: {
    showSkeleton?: boolean;
    skeletonCount?: number;
    emptyStateProps?: {
      onCreatePoll?: () => void;
      onBrowse?: () => void;
    };
  }
) {
  const polls = usePolls(pagination, sort, filters);
  
  const loadingStates = usePollsLoadingStates(
    polls.data,
    polls.isLoading,
    polls.error,
    {
      showSkeleton: config?.showSkeleton ?? true,
      skeletonCount: config?.skeletonCount ?? 4,
      emptyStateProps: config?.emptyStateProps
    }
  );

  return {
    ...polls,
    ...loadingStates,
    hasData: !!polls.data && polls.data.length > 0,
    isEmpty: !polls.data || polls.data.length === 0,
    shouldShowLoading: polls.isLoading && !polls.data,
    shouldShowEmpty: !polls.isLoading && (!polls.data || polls.data.length === 0),
    shouldShowError: !!polls.error && !polls.isLoading,
    shouldShowData: !polls.isLoading && !!polls.data && polls.data.length > 0 && !polls.error
  };
}

// Enhanced hook for active polls with loading states
export function useActivePollsWithLoading(
  limit?: number,
  config?: {
    showSkeleton?: boolean;
    skeletonCount?: number;
    emptyStateProps?: {
      onCreatePoll?: () => void;
      onBrowse?: () => void;
    };
  }
) {
  const active = useActivePolls(limit);
  
  const loadingStates = usePollsLoadingStates(
    active.data,
    active.isLoading,
    active.error,
    {
      showSkeleton: config?.showSkeleton ?? true,
      skeletonCount: config?.skeletonCount ?? 4,
      emptyStateProps: config?.emptyStateProps
    }
  );

  return {
    ...active,
    ...loadingStates,
    hasData: !!active.data && active.data.length > 0,
    isEmpty: !active.data || active.data.length === 0
  };
}

// Enhanced hook for user's poll activity with loading states
export function useUserPollActivityWithLoading(
  userId: string,
  config?: {
    showSkeleton?: boolean;
    skeletonCount?: number;
    emptyStateProps?: {
      onCreatePoll?: () => void;
      onBrowse?: () => void;
    };
  }
) {
  const userPolls = usePollsByAuthor(userId);
  const userVotes = useUserVotes(userId);
  
  const loadingStates = usePollsLoadingStates(
    userPolls.data,
    userPolls.isLoading || userVotes.isLoading,
    userPolls.error || userVotes.error,
    {
      showSkeleton: config?.showSkeleton ?? true,
      skeletonCount: config?.skeletonCount ?? 4,
      emptyStateProps: config?.emptyStateProps
    }
  );

  return {
    userPolls,
    userVotes,
    ...loadingStates,
    hasData: !!userPolls.data && userPolls.data.length > 0,
    isEmpty: !userPolls.data || userPolls.data.length === 0
  };
}
