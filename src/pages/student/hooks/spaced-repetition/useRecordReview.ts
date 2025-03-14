
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { calculateNextReview, calculatePoints } from '@/utils/spacedRepetition';

export interface ReviewResult {
  reviewStat: any;
  points: number;
  nextReviewDate: Date;
}

export const useRecordReview = (userId: string | null) => {
  const queryClient = useQueryClient();

  const recordReviewMutation = useMutation<ReviewResult, Error, { 
    itemId: string, 
    qualityResponse: number, 
    responseTimeMs: number 
  }>({
    mutationFn: async ({ 
      itemId, 
      qualityResponse, 
      responseTimeMs 
    }) => {
      if (!userId) throw new Error('User is not authenticated');
      
      const { data: existingStats, error: statsError } = await supabase
        .from('spaced_repetition_stats')
        .select('*')
        .eq('item_id', itemId)
        .eq('user_id', userId)
        .order('review_date', { ascending: false })
        .limit(1);
      
      if (statsError) throw statsError;
      
      const latestStat = existingStats && existingStats.length > 0 ? existingStats[0] : null;
      
      const {
        easeFactor: newEaseFactor,
        intervalDays: newInterval,
        streak: newStreak,
        nextReviewDate
      } = calculateNextReview(
        qualityResponse, 
        latestStat?.ease_factor || 2.5,
        latestStat?.interval_days || 1,
        latestStat?.streak || 0
      );
      
      const points = calculatePoints(responseTimeMs, qualityResponse);
      
      const { data: reviewStat, error: reviewError } = await supabase
        .from('spaced_repetition_stats')
        .insert({
          item_id: itemId,
          user_id: userId,
          quality_response: qualityResponse,
          response_time_ms: responseTimeMs,
          points_earned: points,
          ease_factor: newEaseFactor,
          interval_days: newInterval,
          streak: newStreak,
          review_date: new Date().toISOString()
        })
        .select()
        .single();
      
      if (reviewError) throw reviewError;
      
      const { error: updateError } = await supabase
        .from('spaced_repetition_items')
        .update({
          next_review_date: nextReviewDate.toISOString(),
          difficulty: 1 / newEaseFactor
        })
        .eq('id', itemId)
        .eq('user_id', userId);
      
      if (updateError) throw updateError;
      
      return { 
        reviewStat,
        points,
        nextReviewDate
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['spaced-repetition-due-items'] });
      queryClient.invalidateQueries({ queryKey: ['spaced-repetition-stats'] });
      queryClient.invalidateQueries({ queryKey: ['spaced-repetition-points'] });
      queryClient.invalidateQueries({ queryKey: ['spaced-repetition-user-stats'] });
    },
    onError: (error) => {
      console.error('Failed to record review:', error);
      toast.error('Failed to record your review');
    }
  });

  return { recordReview: recordReviewMutation.mutateAsync };
};
