
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useSpacedRepetitionStats = (userId: string | null) => {
  const { data: itemStats, isLoading } = useQuery({
    queryKey: ['spaced-repetition-stats', userId],
    queryFn: async () => {
      if (!userId) return {};
      
      const { data, error } = await supabase
        .from('spaced_repetition_stats')
        .select('*')
        .eq('user_id', userId)
        .order('review_date', { ascending: false });
      
      if (error) {
        toast.error('Failed to fetch review stats');
        throw error;
      }
      
      const statsByItem = (data || []).reduce((acc, stat) => {
        if (!acc[stat.item_id]) {
          acc[stat.item_id] = [];
        }
        acc[stat.item_id].push(stat);
        return acc;
      }, {} as Record<string, any[]>);
      
      return statsByItem;
    },
    enabled: !!userId
  });

  return { itemStats, isLoading };
};
