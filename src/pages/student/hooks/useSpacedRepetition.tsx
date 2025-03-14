
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { calculateNextReview, calculatePoints } from '@/utils/spacedRepetition';

export const useSpacedRepetition = () => {
  const queryClient = useQueryClient();
  const [userId, setUserId] = useState<string | null>(null);

  // Get current user ID on component mount
  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        setUserId(data.user.id);
      }
    };
    
    fetchUser();
  }, []);

  // Fetch due items for review
  const { data: dueItems, isLoading: isLoadingDueItems, refetch: refetchDueItems } = useQuery({
    queryKey: ['spaced-repetition-due-items', userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from('spaced_repetition_items')
        .select(`
          id,
          difficulty,
          next_review_date,
          question_id,
          lesson_id,
          question:question_id(
            id,
            question_text,
            question_type,
            points,
            options:quiz_question_options(
              id,
              option_text,
              is_correct,
              order_index
            )
          ),
          lesson:lesson_id(
            id,
            title,
            content
          )
        `)
        .eq('user_id', userId)
        .lte('next_review_date', new Date().toISOString())
        .order('next_review_date', { ascending: true });
      
      if (error) {
        toast.error('Failed to fetch review items');
        throw error;
      }
      
      return data || [];
    },
    enabled: !!userId
  });

  // Fetch stats for each item
  const { data: itemStats, isLoading: isLoadingStats } = useQuery({
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
      
      // Group stats by item_id
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

  // Get user's total points
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

  // Get user's review streaks and stats
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

  // Add a question to the spaced repetition system
  const addItemMutation = useMutation({
    mutationFn: async ({ questionId, lessonId }: { questionId?: string, lessonId?: string }) => {
      if (!userId) throw new Error('User is not authenticated');
      if (!questionId && !lessonId) throw new Error('Either question ID or lesson ID is required');
      
      const { data, error } = await supabase
        .from('spaced_repetition_items')
        .insert({
          user_id: userId,
          question_id: questionId,
          lesson_id: lessonId,
          next_review_date: new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Item added to your review schedule');
      queryClient.invalidateQueries({ queryKey: ['spaced-repetition-due-items'] });
    },
    onError: (error) => {
      console.error('Failed to add item:', error);
      toast.error('Failed to add item to your review schedule');
    }
  });

  // Record a review of an item
  const recordReviewMutation = useMutation({
    mutationFn: async ({ 
      itemId, 
      qualityResponse, 
      responseTimeMs 
    }: { 
      itemId: string, 
      qualityResponse: number, 
      responseTimeMs: number 
    }) => {
      if (!userId) throw new Error('User is not authenticated');
      
      // Get the most recent stats for this item to use for calculations
      const { data: existingStats, error: statsError } = await supabase
        .from('spaced_repetition_stats')
        .select('*')
        .eq('item_id', itemId)
        .eq('user_id', userId)
        .order('review_date', { ascending: false })
        .limit(1);
      
      if (statsError) throw statsError;
      
      const latestStat = existingStats && existingStats.length > 0 ? existingStats[0] : null;
      
      // Calculate next review details using SM-2 algorithm
      const previousEaseFactor = latestStat?.ease_factor || 2.5;
      const previousInterval = latestStat?.interval_days || 1;
      const previousStreak = latestStat?.streak || 0;
      
      const {
        easeFactor: newEaseFactor,
        intervalDays: newInterval,
        streak: newStreak,
        nextReviewDate
      } = calculateNextReview(
        qualityResponse, 
        previousEaseFactor, 
        previousInterval, 
        previousStreak
      );
      
      // Calculate points
      const points = calculatePoints(responseTimeMs, qualityResponse);
      
      // Insert review statistics
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
          streak: newStreak
        })
        .select()
        .single();
      
      if (reviewError) throw reviewError;
      
      // Update the item's next review date
      const { error: updateError } = await supabase
        .from('spaced_repetition_items')
        .update({
          next_review_date: nextReviewDate.toISOString(),
          difficulty: 1 / newEaseFactor // Convert ease factor to difficulty (inverse relationship)
        })
        .eq('id', itemId)
        .eq('user_id', userId);
      
      if (updateError) throw updateError;
      
      return { reviewStat, points, nextReviewDate };
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

  // Find or add questions from a completed quiz
  const addQuestionsFromQuizMutation = useMutation({
    mutationFn: async ({ 
      quizId,
      lessonId
    }: { 
      quizId: string,
      lessonId?: string
    }) => {
      if (!userId) throw new Error('User is not authenticated');
      
      // Fetch all questions for the quiz
      const { data: questions, error: questionsError } = await supabase
        .from('quiz_questions')
        .select('id')
        .eq('quiz_id', quizId);
      
      if (questionsError) throw questionsError;
      
      if (!questions || questions.length === 0) {
        return { added: 0 };
      }
      
      // Check which questions are already in the system
      const questionIds = questions.map(q => q.id);
      const { data: existingItems, error: existingError } = await supabase
        .from('spaced_repetition_items')
        .select('question_id')
        .eq('user_id', userId)
        .in('question_id', questionIds);
      
      if (existingError) throw existingError;
      
      // Filter out questions that are already in the system
      const existingQuestionIds = (existingItems || []).map(item => item.question_id);
      const newQuestionIds = questionIds.filter(id => !existingQuestionIds.includes(id));
      
      if (newQuestionIds.length === 0) {
        return { added: 0 };
      }
      
      // Add new questions to the system
      const itemsToInsert = newQuestionIds.map(questionId => ({
        user_id: userId,
        question_id: questionId,
        lesson_id: lessonId,
        next_review_date: new Date().toISOString()
      }));
      
      const { data: insertedItems, error: insertError } = await supabase
        .from('spaced_repetition_items')
        .insert(itemsToInsert)
        .select();
      
      if (insertError) throw insertError;
      
      return { added: insertedItems?.length || 0 };
    },
    onSuccess: (data) => {
      if (data.added > 0) {
        toast.success(`Added ${data.added} new questions to your review schedule`);
        queryClient.invalidateQueries({ queryKey: ['spaced-repetition-due-items'] });
      }
    },
    onError: (error) => {
      console.error('Failed to add questions from quiz:', error);
      toast.error('Failed to add questions to your review schedule');
    }
  });

  return {
    dueItems,
    itemStats,
    totalPoints,
    userStats,
    isLoading: isLoadingDueItems || isLoadingStats,
    addItem: addItemMutation.mutate,
    recordReview: recordReviewMutation.mutate,
    addQuestionsFromQuiz: addQuestionsFromQuizMutation.mutate,
    refetchDueItems
  };
};
