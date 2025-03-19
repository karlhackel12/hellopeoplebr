
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useAddSpacedRepetitionItem = (userId: string | null) => {
  const queryClient = useQueryClient();

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

  return { addItem: addItemMutation.mutate };
};
