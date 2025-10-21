import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Thread {
  id: string;
  message_id: string;
  user_id: string;
  reply: string;
  created_at: string;
  updated_at: string;
  author?: {
    username: string;
    role: string;
    region: string;
  };
}

export const useThreads = (messageId: string | null) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch threads/replies for a specific message
  const { data: threads = [], isLoading, error } = useQuery({
    queryKey: ['threads', messageId],
    queryFn: async () => {
      if (!messageId) return [];

      const { data, error } = await supabase
        .from('threads')
        .select(`
          *,
          author:profiles!threads_user_id_fkey(username, role, region)
        `)
        .eq('message_id', messageId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as Thread[];
    },
    enabled: !!messageId,
  });

  // Send reply mutation
  const sendReplyMutation = useMutation({
    mutationFn: async ({ messageId: msgId, reply }: { messageId: string; reply: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('threads')
        .insert({
          message_id: msgId,
          user_id: user.id,
          reply: reply.trim(),
        })
        .select(`
          *,
          author:profiles!threads_user_id_fkey(username, role, region)
        `)
        .single();

      if (error) throw error;
      return data as Thread;
    },
    onSuccess: (data) => {
      console.log('Reply sent successfully:', data);
      queryClient.invalidateQueries({ queryKey: ['threads', data.message_id] });
      
      toast({
        title: 'Reply sent',
        description: 'Your reply has been posted successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Failed to send reply',
        description: error.message || 'Please try again',
        variant: 'destructive',
      });
    },
  });

  // Set up real-time subscription for threads
  useEffect(() => {
    if (!messageId) return;

    console.log('🔄 Setting up real-time subscription for threads on message:', messageId);

    const channel = supabase
      .channel(`realtime:threads:${messageId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'threads',
          filter: `message_id=eq.${messageId}`,
        },
        async (payload) => {
          console.log('💬 New thread reply received:', payload.new);
          
          // Get the full thread with author information
          const { data: newThread, error } = await supabase
            .from('threads')
            .select(`
              *,
              author:profiles!threads_user_id_fkey(username, role, region)
            `)
            .eq('id', payload.new.id)
            .single();

          if (error) {
            console.error('Error fetching thread details:', error);
            return;
          }

          console.log('✅ Fetched thread with author:', newThread);

          // Update the query cache
          queryClient.setQueryData(['threads', messageId], (oldThreads: Thread[] = []) => {
            // Check for duplicates
            if (oldThreads.some(thread => thread.id === newThread.id)) {
              console.log('⚠️ Thread already exists, skipping');
              return oldThreads;
            }
            
            // Add new thread and sort by created_at
            const updatedThreads = [...oldThreads, newThread as Thread].sort(
              (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
            );
            
            console.log('✅ Threads updated. Count:', updatedThreads.length);
            return updatedThreads;
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'threads',
          filter: `message_id=eq.${messageId}`,
        },
        (payload) => {
          console.log('🗑️ Thread deleted:', payload.old.id);
          
          // Remove from cache
          queryClient.setQueryData(['threads', messageId], (oldThreads: Thread[] = []) => {
            return oldThreads.filter(thread => thread.id !== payload.old.id);
          });
        }
      )
      .subscribe((status) => {
        console.log('📡 Threads realtime status:', status);
        
        if (status === 'SUBSCRIBED') {
          console.log('✅ Successfully subscribed to threads for message:', messageId);
        }
      });

    // Cleanup
    return () => {
      console.log('🧹 Cleaning up threads subscription for message:', messageId);
      supabase.removeChannel(channel);
    };
  }, [messageId, queryClient]);

  // Send reply function
  const sendReply = useCallback((reply: string) => {
    if (!reply.trim() || !messageId) return;
    sendReplyMutation.mutate({ messageId, reply });
  }, [messageId, sendReplyMutation]);

  return {
    threads,
    isLoading,
    error,
    sendReply,
    isSending: sendReplyMutation.isPending,
  };
};

// Hook to get thread count for a message (without fetching all threads)
export const useThreadCount = (messageId: string | null) => {
  const { data: count = 0 } = useQuery({
    queryKey: ['thread-count', messageId],
    queryFn: async () => {
      if (!messageId) return 0;

      const { count, error } = await supabase
        .from('threads')
        .select('*', { count: 'exact', head: true })
        .eq('message_id', messageId);

      if (error) throw error;
      return count || 0;
    },
    enabled: !!messageId,
  });

  return count;
};




