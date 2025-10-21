import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Reaction {
  id: string;
  message_id: string;
  user_id: string;
  emoji: string;
  created_at: string;
}

export interface ReactionCount {
  emoji: string;
  count: number;
  userReacted: boolean;
}

export const useReactions = (messageId: string, currentUserId?: string) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch reactions for a message
  const { data: reactions = [], isLoading } = useQuery({
    queryKey: ['reactions', messageId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reactions')
        .select('*')
        .eq('message_id', messageId);

      if (error) throw error;
      return data as Reaction[];
    },
  });

  // Add reaction mutation
  const addReactionMutation = useMutation({
    mutationFn: async (emoji: string = '👍') => {
      if (!currentUserId) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('reactions')
        .insert({
          message_id: messageId,
          user_id: currentUserId,
          emoji,
        })
        .select()
        .single();

      if (error) throw error;
      return data as Reaction;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reactions', messageId] });
    },
    onError: (error: any) => {
      // Check if it's a duplicate reaction error
      if (error.code === '23505') {
        toast({
          title: 'Already reacted',
          description: 'You have already reacted to this message',
          variant: 'default',
        });
      } else {
        toast({
          title: 'Failed to add reaction',
          description: error.message || 'Please try again',
          variant: 'destructive',
        });
      }
    },
  });

  // Remove reaction mutation
  const removeReactionMutation = useMutation({
    mutationFn: async (emoji: string = '👍') => {
      if (!currentUserId) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('reactions')
        .delete()
        .eq('message_id', messageId)
        .eq('user_id', currentUserId)
        .eq('emoji', emoji);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reactions', messageId] });
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to remove reaction',
        description: error.message || 'Please try again',
        variant: 'destructive',
      });
    },
  });

  // Set up real-time subscription for reactions
  useEffect(() => {
    console.log('🔄 Setting up real-time subscription for reactions on message:', messageId);

    const channel = supabase
      .channel(`realtime:reactions:${messageId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'reactions',
          filter: `message_id=eq.${messageId}`,
        },
        (payload) => {
          console.log('👍 New reaction received:', payload.new);
          queryClient.invalidateQueries({ queryKey: ['reactions', messageId] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'reactions',
          filter: `message_id=eq.${messageId}`,
        },
        (payload) => {
          console.log('👎 Reaction removed:', payload.old);
          queryClient.invalidateQueries({ queryKey: ['reactions', messageId] });
        }
      )
      .subscribe((status) => {
        console.log('📡 Reactions realtime status:', status);
      });

    return () => {
      console.log('🧹 Cleaning up reactions subscription for message:', messageId);
      supabase.removeChannel(channel);
    };
  }, [messageId, queryClient]);

  // Calculate reaction counts by emoji
  const reactionCounts: ReactionCount[] = reactions.reduce((acc, reaction) => {
    const existing = acc.find(r => r.emoji === reaction.emoji);
    const isUserReaction = currentUserId === reaction.user_id;

    if (existing) {
      existing.count += 1;
      if (isUserReaction) existing.userReacted = true;
    } else {
      acc.push({
        emoji: reaction.emoji,
        count: 1,
        userReacted: isUserReaction,
      });
    }

    return acc;
  }, [] as ReactionCount[]);

  // Toggle reaction (add if not exists, remove if exists)
  const toggleReaction = (emoji: string = '👍') => {
    const userReaction = reactions.find(
      r => r.user_id === currentUserId && r.emoji === emoji
    );

    if (userReaction) {
      removeReactionMutation.mutate(emoji);
    } else {
      addReactionMutation.mutate(emoji);
    }
  };

  return {
    reactions,
    reactionCounts,
    isLoading,
    toggleReaction,
    isToggling: addReactionMutation.isPending || removeReactionMutation.isPending,
  };
};



