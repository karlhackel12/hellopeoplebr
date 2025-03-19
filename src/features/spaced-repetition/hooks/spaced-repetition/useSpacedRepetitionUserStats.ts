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
        .select(`
          count: count(*),
          best_streak: max(streak),
          total_score: sum(points_earned)
        `)
        .eq('user_id', userId);
      
      if (error) {
        toast.error('Failed to fetch user stats');
        throw error;
      }
      
      const stats = data?.[0] || { count: 0, best_streak: 0, total_score: 0 };
      const totalReviews = stats.count;
      const bestStreak = stats.best_streak;
      const averageScore = totalReviews > 0 ? Math.round(stats.total_score / totalReviews) : 0;
      
      return { totalReviews, bestStreak, averageScore };
    },
    enabled: !!userId
  });

  return { userStats };
};
