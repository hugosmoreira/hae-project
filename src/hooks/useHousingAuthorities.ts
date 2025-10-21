import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { HousingAuthority } from '@/contexts/PHAContext';

export const useHousingAuthorities = () => {
  const { data: phas = [], isLoading, error } = useQuery({
    queryKey: ['housing-authorities'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('housing_authorities')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      return data as HousingAuthority[];
    },
  });

  // Group by region
  const phasByRegion = phas.reduce((acc, pha) => {
    const region = pha.region || 'Other';
    if (!acc[region]) {
      acc[region] = [];
    }
    acc[region].push(pha);
    return acc;
  }, {} as Record<string, HousingAuthority[]>);

  // Group by state
  const phasByState = phas.reduce((acc, pha) => {
    const state = pha.state || 'Other';
    if (!acc[state]) {
      acc[state] = [];
    }
    acc[state].push(pha);
    return acc;
  }, {} as Record<string, HousingAuthority[]>);

  return {
    phas,
    phasByRegion,
    phasByState,
    isLoading,
    error,
  };
};




