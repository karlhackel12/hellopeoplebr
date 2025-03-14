
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useSpacedRepetitionPoints = (userId: string | null) => {
  const { data: totalPoints } = useQuery({
    queryKey: ['spaced-repetition-points', userId],
    queryFn: async () => {
      if (!userId) return 0;
      
      const { data, error } = await supabase
        .from('spaced_repetition_stats')
        .select('points_earned')
        .eq('user_id', userId);
      
      if (error) {
        toast.error('Failed to fetch points');
        throw error;
      }
      
      return (data || []).reduce((sum, item) => sum + (item.points_earned || 0), 0);
    },
    enabled: !!userId
  });

  return { totalPoints };
};
