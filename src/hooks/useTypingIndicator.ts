import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useDebounce } from './useDebounce';

export interface TypingUser {
  user_id: string;
  username: string;
  role: string;
  last_typed: string;
}

export const useTypingIndicator = (channelId: string | null) => {
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);

  // Debounced typing state to avoid too many updates
  const debouncedIsTyping = useDebounce(isTyping, 100);

  // Get current user info
  const getCurrentUser = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: profile } = await supabase
      .from('profiles')
      .select('username, role')
      .eq('id', user.id)
      .single();

    return {
      user_id: user.id,
      username: profile?.username || 'Anonymous',
      role: profile?.role || 'User'
    };
  }, []);

  // Start typing
  const startTyping = useCallback(async () => {
    if (!channelId || isTyping) return;

    const currentUser = await getCurrentUser();
    if (!currentUser) return;

    setIsTyping(true);

    // Broadcast typing status
    await supabase
      .channel(`typing:${channelId}`)
      .send({
        type: 'typing_start',
        payload: {
          user_id: currentUser.user_id,
          username: currentUser.username,
          role: currentUser.role,
          channel_id: channelId,
          timestamp: new Date().toISOString()
        }
      });

    // Set timeout to stop typing after 3 seconds of inactivity
    if (typingTimeout) clearTimeout(typingTimeout);
    const timeout = setTimeout(() => {
      stopTyping();
    }, 3000);
    setTypingTimeout(timeout);
  }, [channelId, isTyping, typingTimeout, getCurrentUser]);

  // Stop typing
  const stopTyping = useCallback(async () => {
    if (!channelId || !isTyping) return;

    const currentUser = await getCurrentUser();
    if (!currentUser) return;

    setIsTyping(false);

    // Broadcast stop typing
    await supabase
      .channel(`typing:${channelId}`)
      .send({
        type: 'typing_stop',
        payload: {
          user_id: currentUser.user_id,
          channel_id: channelId,
          timestamp: new Date().toISOString()
        }
      });

    if (typingTimeout) {
      clearTimeout(typingTimeout);
      setTypingTimeout(null);
    }
  }, [channelId, isTyping, typingTimeout, getCurrentUser]);

  // Set up real-time subscription for typing indicators
  useEffect(() => {
    if (!channelId) return;

    const channel = supabase
      .channel(`typing:${channelId}`)
      .on('broadcast', { event: 'typing_start' }, (payload) => {
        const { user_id, username, role, timestamp } = payload.payload;
        
        setTypingUsers(prev => {
          // Remove existing entry for this user
          const filtered = prev.filter(user => user.user_id !== user_id);
          // Add new entry
          return [...filtered, { user_id, username, role, last_typed: timestamp }];
        });
      })
      .on('broadcast', { event: 'typing_stop' }, (payload) => {
        const { user_id } = payload.payload;
        
        setTypingUsers(prev => 
          prev.filter(user => user.user_id !== user_id)
        );
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [channelId]);

  // Clean up typing users that haven't typed in 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().getTime();
      setTypingUsers(prev => 
        prev.filter(user => {
          const lastTyped = new Date(user.last_typed).getTime();
          return now - lastTyped < 5000; // Keep users who typed within last 5 seconds
        })
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }
      if (isTyping && channelId) {
        stopTyping();
      }
    };
  }, [typingTimeout, isTyping, channelId, stopTyping]);

  return {
    typingUsers,
    isTyping,
    startTyping,
    stopTyping
  };
};
