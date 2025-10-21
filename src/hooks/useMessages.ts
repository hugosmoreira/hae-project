import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useCurrentPHA } from '@/contexts/PHAContext';

export interface Message {
  id: string;
  channel_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  pha_id: string | null;
  author?: {
    username: string;
    role: string;
    region: string;
  };
}

export interface OptimisticMessage {
  id: string;
  channel_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  isOptimistic: true;
  author?: {
    username: string;
    role: string;
    region: string;
  };
}

export const useMessages = (channelId: string | null) => {
  const [optimisticMessages, setOptimisticMessages] = useState<OptimisticMessage[]>([]);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch messages for the channel
  const { data: messages = [], isLoading, error } = useQuery({
    queryKey: ['messages', channelId],
    queryFn: async () => {
      if (!channelId) return [];

      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          author:profiles!messages_user_id_fkey(username, role, region)
        `)
        .eq('channel_id', channelId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      // We queried newest first, reverse to chronological ascending for UI
      return (data as Message[]).slice().reverse();
    },
    enabled: !!channelId,
  });

  // Send message mutation with optimistic updates
  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!channelId) throw new Error('No channel selected');

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('messages')
        .insert({
          channel_id: channelId,
          user_id: user.id,
          content: content.trim(),
        })
        .select(`
          *,
          author:profiles!messages_user_id_fkey(username, role, region)
        `)
        .single();

      if (error) throw error;
      return data as Message;
    },
    onMutate: async (content: string) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['messages', channelId] });

      // Get current user info for optimistic update
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('username, role, region')
        .eq('id', user.id)
        .single();

      // Create optimistic message
      const optimisticMessage: OptimisticMessage = {
        id: `temp-${Date.now()}`,
        channel_id: channelId!,
        user_id: user.id,
        content: content.trim(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        isOptimistic: true,
        author: profile,
      };

      console.log('Adding optimistic message:', optimisticMessage);

      // Add to optimistic messages
      setOptimisticMessages(prev => {
        const updated = [...prev, optimisticMessage];
        console.log('Optimistic messages after add:', updated);
        return updated;
      });

      // Return context for potential rollback
      return { optimisticMessage };
    },
    onSuccess: (data) => {
      console.log('Message sent successfully:', data);
      
      // Remove the optimistic message
      setOptimisticMessages(prev => 
        prev.filter(msg => !msg.isOptimistic || msg.content !== data.content)
      );
      
      // Invalidate queries to ensure we have the latest data
      // The real-time listener will also pick up the new message
      queryClient.invalidateQueries({ queryKey: ['messages', channelId] });
    },
    onError: (error, variables, context) => {
      // Remove the failed optimistic message
      if (context?.optimisticMessage) {
        setOptimisticMessages(prev => 
          prev.filter(msg => msg.id !== context.optimisticMessage.id)
        );
      }

      toast({
        title: 'Failed to send message',
        description: error.message || 'Please try again',
        variant: 'destructive',
      });
    },
  });

  // Set up real-time subscription using current Supabase Realtime API
  useEffect(() => {
    if (!channelId) return;

    console.log('🔄 Setting up real-time subscription for channel:', channelId);

    // Use the current Supabase Realtime API format
    const channel = supabase
      .channel(`realtime:messages:${channelId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `channel_id=eq.${channelId}`,
        },
        async (payload) => {
          console.log('📨 New message received:', payload.new);
          
          // Get the full message with author information
          const { data: newMessage, error } = await supabase
            .from('messages')
            .select(`
              *,
              author:profiles!messages_user_id_fkey(username, role, region)
            `)
            .eq('id', payload.new.id)
            .single();

          if (error) {
            console.error('Error fetching message details:', error);
            return;
          }

          console.log('✅ Fetched message with author:', newMessage);

          // Transform the message to match the expected structure
          const transformedMessage: Message = {
            id: newMessage.id,
            channel_id: newMessage.channel_id,
            user_id: newMessage.user_id,
            content: typeof newMessage.content === 'string' ? newMessage.content : String(newMessage.content || ''),
            created_at: newMessage.created_at,
            updated_at: newMessage.updated_at,
            author: newMessage.author ? {
              username: newMessage.author.username,
              role: newMessage.author.role,
              region: newMessage.author.region
            } : undefined
          };

          // Update the query cache
          queryClient.setQueryData(['messages', channelId], (oldMessages: Message[] = []) => {
            // Check for duplicates
            if (oldMessages.some(msg => msg.id === transformedMessage.id)) {
              console.log('⚠️ Message already exists, skipping');
              return oldMessages;
            }
            
            // Add new message and sort by created_at
            const updatedMessages = [...oldMessages, transformedMessage].sort(
              (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
            );
            
            console.log('✅ Messages updated. Count:', updatedMessages.length);
            return updatedMessages;
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `channel_id=eq.${channelId}`,
        },
        async (payload) => {
          console.log('📝 Message updated:', payload.new);
          
          // Get updated message with author info
          const { data: updatedMessage, error } = await supabase
            .from('messages')
            .select(`
              *,
              author:profiles!messages_user_id_fkey(username, role, region)
            `)
            .eq('id', payload.new.id)
            .single();

          if (error) {
            console.error('Error fetching updated message:', error);
            return;
          }

          // Transform the message
          const transformedMessage: Message = {
            id: updatedMessage.id,
            channel_id: updatedMessage.channel_id,
            user_id: updatedMessage.user_id,
            content: typeof updatedMessage.content === 'string' ? updatedMessage.content : String(updatedMessage.content || ''),
            created_at: updatedMessage.created_at,
            updated_at: updatedMessage.updated_at,
            author: updatedMessage.author ? {
              username: updatedMessage.author.username,
              role: updatedMessage.author.role,
              region: updatedMessage.author.region
            } : undefined
          };

          // Update in cache
          queryClient.setQueryData(['messages', channelId], (oldMessages: Message[] = []) => {
            return oldMessages.map(msg => 
              msg.id === transformedMessage.id ? transformedMessage : msg
            );
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'messages',
          filter: `channel_id=eq.${channelId}`,
        },
        (payload) => {
          console.log('🗑️ Message deleted:', payload.old.id);
          
          // Remove from cache
          queryClient.setQueryData(['messages', channelId], (oldMessages: Message[] = []) => {
            return oldMessages.filter(msg => msg.id !== payload.old.id);
          });
        }
      )
      .subscribe((status) => {
        console.log('📡 Realtime status:', status);
        
        if (status === 'SUBSCRIBED') {
          console.log('✅ Successfully subscribed to channel:', channelId);
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ Channel subscription error');
        } else if (status === 'TIMED_OUT') {
          console.error('⏱️ Subscription timed out');
        } else if (status === 'CLOSED') {
          console.log('🔒 Channel closed');
        }
      });

    // Cleanup
    return () => {
      console.log('🧹 Cleaning up subscription for channel:', channelId);
      supabase.removeChannel(channel);
    };
  }, [channelId, queryClient]);

  // Send message function
  const sendMessage = useCallback((content: string) => {
    if (!content.trim()) return;
    sendMessageMutation.mutate(content);
  }, [sendMessageMutation]);

  // Combine real messages with optimistic messages
  const allMessages = [...messages, ...optimisticMessages].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  return {
    messages: allMessages,
    isLoading,
    error,
    sendMessage,
    isSending: sendMessageMutation.isPending,
  };
};
