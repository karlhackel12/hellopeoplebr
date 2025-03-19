
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useSpacedRepetitionUserStats = (userId: string | null) => {
  const { data: userStats } = useQuery({
    queryKey: ['spaced-repetition-user-stats', userId],
    queryFn: async () => {
      if (!userId) return { totalReviews: 0, bestStreak: 0, averageScore: 0 };
      
      const { data, error } = await supabase
        .from('spaced_repetition_stats')
        .select('*')
        .eq('user_id', userId);
      
      if (error) {
        toast.error('Failed to fetch user stats');
        throw error;
      }
      
      const stats = data || [];
      const totalReviews = stats.length;
      const bestStreak = stats.reduce((max, stat) => Math.max(max, stat.streak), 0);
      const totalScore = stats.reduce((sum, stat) => sum + (stat.points_earned || 0), 0);
      const averageScore = totalReviews > 0 ? Math.round(totalScore / totalReviews) : 0;
      
      return { totalReviews, bestStreak, averageScore };
    },
    enabled: !!userId
  });

  return { userStats };
};
