import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface HousingAuthority {
  id: string;
  name: string;
  state: string | null;
  region: string | null;
  size_category: string | null;
  share_data: boolean;
  created_at: string;
  updated_at: string;
}

interface PHAContextType {
  currentPHA: HousingAuthority | null;
  isLoading: boolean;
  error: Error | null;
  refreshPHA: () => Promise<void>;
}

const PHAContext = createContext<PHAContextType | undefined>(undefined);

export function PHAProvider({ children }: { children: React.ReactNode }) {
  const [currentPHA, setCurrentPHA] = useState<HousingAuthority | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchCurrentPHA = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) throw userError;
      if (!user) {
        setCurrentPHA(null);
        setIsLoading(false);
        return;
      }

      // Get user's profile with PHA information
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select(`
          pha_id,
          housing_authorities (
            id,
            name,
            state,
            region,
            size_category,
            share_data,
            created_at,
            updated_at
          )
        `)
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Error fetching profile with PHA:', profileError);
        throw profileError;
      }

      // Set the PHA from the profile
      if (profile?.housing_authorities) {
        setCurrentPHA(profile.housing_authorities as unknown as HousingAuthority);
      } else {
        setCurrentPHA(null);
      }
    } catch (err) {
      console.error('Error in fetchCurrentPHA:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch PHA'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentPHA();

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        fetchCurrentPHA();
      } else if (event === 'SIGNED_OUT') {
        setCurrentPHA(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const value: PHAContextType = {
    currentPHA,
    isLoading,
    error,
    refreshPHA: fetchCurrentPHA,
  };

  return <PHAContext.Provider value={value}>{children}</PHAContext.Provider>;
}

// Hook to use PHA context
export function usePHAContext() {
  const context = useContext(PHAContext);
  if (context === undefined) {
    throw new Error('usePHAContext must be used within a PHAProvider');
  }
  return context;
}

// Convenience hook to get just the current PHA
export function useCurrentPHA() {
  const { currentPHA, isLoading, error } = usePHAContext();
  return { currentPHA, isLoading, error };
}




