
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useSpacedRepetitionDueItems = (userId: string | null) => {
  const { data: dueItems, isLoading, refetch } = useQuery({
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
          question:quiz_questions(
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
          lesson:lessons(
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
        console.error('Error fetching spaced repetition items:', error);
        throw error;
      }
      
      return data || [];
    },
    enabled: !!userId
  });

  return { dueItems, isLoading, refetch };
};
