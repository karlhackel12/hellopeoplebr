import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const PAGE_SIZE = 20;
const CACHE_TIME = 5 * 60 * 1000; // 5 minutos
const STALE_TIME = 2 * 60 * 1000; // 2 minutos

export const useSpacedRepetitionStats = (userId: string | null, page: number = 1) => {
  const { data: itemStats, isLoading } = useQuery({
    queryKey: ['spaced-repetition-stats', userId, page],
    queryFn: async () => {
      if (!userId) return { stats: {}, total: 0 };
      
      const start = (page - 1) * PAGE_SIZE;
      const end = start + PAGE_SIZE - 1;
      
      const { data, error, count } = await supabase
        .from('spaced_repetition_stats')
        .select('item_id, quality_response, points_earned, streak, review_date', { count: 'exact' })
        .eq('user_id', userId)
        .order('review_date', { ascending: false })
        .range(start, end);
      
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
      
      return {
        stats: statsByItem,
        total: count || 0
      };
    },
    enabled: !!userId,
    staleTime: STALE_TIME,
    cacheTime: CACHE_TIME,
    keepPreviousData: true
  });

  return { 
    itemStats: itemStats?.stats || {}, 
    total: itemStats?.total || 0,
    isLoading,
    hasMore: itemStats ? (page * PAGE_SIZE) < itemStats.total : false
  };
};
