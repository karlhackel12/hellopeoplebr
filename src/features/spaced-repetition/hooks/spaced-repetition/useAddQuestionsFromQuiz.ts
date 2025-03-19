
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useAddQuestionsFromQuiz = (userId: string | null) => {
  const queryClient = useQueryClient();

  const addQuestionsFromQuizMutation = useMutation({
    mutationFn: async ({ 
      quizId,
      lessonId
    }: { 
      quizId: string,
      lessonId?: string
    }) => {
      if (!userId) throw new Error('User is not authenticated');
      
      const { data: questions, error: questionsError } = await supabase
        .from('quiz_questions')
        .select('id')
        .eq('quiz_id', quizId);
      
      if (questionsError) throw questionsError;
      
      if (!questions || questions.length === 0) {
        return { added: 0 };
      }
      
      const questionIds = questions.map(q => q.id);
      const { data: existingItems, error: existingError } = await supabase
        .from('spaced_repetition_items')
        .select('question_id')
        .eq('user_id', userId)
        .in('question_id', questionIds);
      
      if (existingError) throw existingError;
      
      const existingQuestionIds = (existingItems || []).map(item => item.question_id);
      const newQuestionIds = questionIds.filter(id => !existingQuestionIds.includes(id));
      
      if (newQuestionIds.length === 0) {
        return { added: 0 };
      }
      
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

  return { addQuestionsFromQuiz: addQuestionsFromQuizMutation.mutate };
};
