
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Question } from '@/components/teacher/quiz/types';

interface QuizData {
  id: string;
  title: string;
  is_published: boolean;
  lesson_id: string;
  pass_percent: number;
  created_at: string;
  updated_at: string;
}

export const useQuizDataManager = (lessonId: string) => {
  const queryClient = useQueryClient();
  const [isSaving, setIsSaving] = useState(false);

  // Fetch quiz data
  const { data: quizData, isLoading: quizLoading, error: quizError } = useQuery({
    queryKey: ['quiz', lessonId],
    queryFn: async () => {
      if (!lessonId) return null;
      
      const { data, error } = await supabase
        .from('quizzes')
        .select('*')
        .eq('lesson_id', lessonId)
        .maybeSingle();
      
      if (error) throw error;
      return data as QuizData | null;
    },
    enabled: !!lessonId
  });

  // Fetch quiz questions
  const { data: questions, isLoading: questionsLoading, error: questionsError } = useQuery({
    queryKey: ['quiz-questions', quizData?.id],
    queryFn: async () => {
      if (!quizData?.id) return [];
      
      const { data, error } = await supabase
        .from('quiz_questions')
        .select(`
          *,
          quiz_question_options(*)
        `)
        .eq('quiz_id', quizData.id)
        .order('order_index', { ascending: true });
      
      if (error) throw error;
      
      return data.map(question => ({
        id: question.id,
        quizId: question.quiz_id,
        text: question.question_text,
        type: question.question_type,
        points: question.points,
        options: question.quiz_question_options.map(option => ({
          id: option.id,
          text: option.option_text,
          isCorrect: option.is_correct,
          questionId: question.id,
        })),
        orderIndex: question.order_index
      })) as Question[];
    },
    enabled: !!quizData?.id
  });

  // Update quiz title
  const updateTitleMutation = useMutation({
    mutationFn: async (title: string) => {
      if (!quizData?.id) throw new Error('No quiz found');
      
      setIsSaving(true);
      
      const { error } = await supabase
        .from('quizzes')
        .update({ title, updated_at: new Date().toISOString() })
        .eq('id', quizData.id);
      
      if (error) throw error;
      return title;
    },
    onSuccess: (title) => {
      queryClient.setQueryData(['quiz', lessonId], (oldData: any) => {
        return oldData ? { ...oldData, title } : oldData;
      });
      
      toast.success('Quiz title updated');
      setIsSaving(false);
    },
    onError: (error) => {
      console.error('Error updating quiz title:', error);
      toast.error('Failed to update quiz title');
      setIsSaving(false);
    }
  });

  // Toggle publish status
  const togglePublishMutation = useMutation({
    mutationFn: async (publish: boolean) => {
      if (!quizData?.id) throw new Error('No quiz found');
      
      setIsSaving(true);
      
      const { error } = await supabase
        .from('quizzes')
        .update({ 
          is_published: publish,
          updated_at: new Date().toISOString() 
        })
        .eq('id', quizData.id);
      
      if (error) throw error;
      return publish;
    },
    onSuccess: (published) => {
      queryClient.setQueryData(['quiz', lessonId], (oldData: any) => {
        return oldData ? { ...oldData, is_published: published } : oldData;
      });
      
      toast.success(published ? 'Quiz published' : 'Quiz unpublished');
      setIsSaving(false);
    },
    onError: (error) => {
      console.error('Error toggling publish status:', error);
      toast.error('Failed to update publish status');
      setIsSaving(false);
    }
  });

  // Delete quiz
  const deleteQuizMutation = useMutation({
    mutationFn: async () => {
      if (!quizData?.id) throw new Error('No quiz found');
      
      setIsSaving(true);
      
      const { error } = await supabase
        .from('quizzes')
        .delete()
        .eq('id', quizData.id);
      
      if (error) throw error;
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quiz', lessonId] });
      toast.success('Quiz deleted');
      setIsSaving(false);
    },
    onError: (error) => {
      console.error('Error deleting quiz:', error);
      toast.error('Failed to delete quiz');
      setIsSaving(false);
    }
  });

  return {
    quizData,
    questions,
    isLoading: quizLoading || questionsLoading,
    isSaving,
    error: quizError || questionsError,
    updateTitle: (title: string) => updateTitleMutation.mutate(title),
    togglePublish: (publish: boolean) => togglePublishMutation.mutate(publish),
    deleteQuiz: () => deleteQuizMutation.mutate()
  };
};
