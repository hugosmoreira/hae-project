import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCurrentPHA } from '@/contexts/PHAContext';

export interface Channel {
  id: string;
  name: string;
  description: string | null;
  category: string;
  is_public: boolean;
  member_count: number;
  pha_id: string | null;
  created_at: string;
  updated_at: string;
}

export const useChannels = () => {
  const queryClient = useQueryClient();
  const { currentPHA } = useCurrentPHA();

  // Fetch public channels for current PHA
  const { data: channels = [], isLoading, error } = useQuery({
    queryKey: ['channels', currentPHA?.id],
    queryFn: async () => {
      if (!currentPHA?.id) return [];

      const { data, error } = await supabase
        .from('channels')
        .select('*')
        .eq('is_public', true)
        .eq('pha_id', currentPHA.id)
        .order('category', { ascending: true })
        .order('name', { ascending: true });

      if (error) throw error;
      return data as Channel[];
    },
    enabled: !!currentPHA?.id,
  });

  // Set up real-time subscription for channels
  useEffect(() => {
    console.log('🔄 Setting up real-time subscription for channels');

    const channel = supabase
      .channel('realtime:channels')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'channels',
        },
        (payload) => {
          console.log('📢 New channel created:', payload.new);
          queryClient.invalidateQueries({ queryKey: ['channels'] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'channels',
        },
        (payload) => {
          console.log('📝 Channel updated:', payload.new);
          queryClient.invalidateQueries({ queryKey: ['channels'] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'channels',
        },
        (payload) => {
          console.log('🗑️ Channel deleted:', payload.old.id);
          queryClient.invalidateQueries({ queryKey: ['channels'] });
        }
      )
      .subscribe((status) => {
        console.log('📡 Channels realtime status:', status);
        
        if (status === 'SUBSCRIBED') {
          console.log('✅ Successfully subscribed to channels');
        }
      });

    // Cleanup
    return () => {
      console.log('🧹 Cleaning up channels subscription');
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  // Group channels by category
  const channelsByCategory = channels.reduce((acc, channel) => {
    const category = channel.category || 'general';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(channel);
    return acc;
  }, {} as Record<string, Channel[]>);

  return {
    channels,
    channelsByCategory,
    isLoading,
    error,
  };
};

