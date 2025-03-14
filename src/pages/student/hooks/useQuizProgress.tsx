
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface QuizProgressData {
  quizId: string;
  userId: string;
  currentQuestion: number;
  answers: Record<string, string>;
  started_at: string;
  completed_at?: string;
  score?: number;
}

export const useQuizProgress = (quizId: string | undefined) => {
  const queryClient = useQueryClient();
  const [currentAnswers, setCurrentAnswers] = useState<Record<string, string>>({});

  // Fetch quiz progress
  const { data: quizProgress } = useQuery({
    queryKey: ['student-quiz-progress', quizId],
    queryFn: async () => {
      if (!quizId) throw new Error('Quiz ID is required');
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('user_quiz_progress')
        .select('*')
        .eq('quiz_id', quizId)
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error && error.code !== 'PGRST116') throw error;
      
      return data;
    },
    enabled: !!quizId
  });

  // Update answers in state when progress data is loaded
  useEffect(() => {
    if (quizProgress?.answers) {
      setCurrentAnswers(quizProgress.answers);
    }
  }, [quizProgress]);

  // Update progress mutation
  const updateProgressMutation = useMutation({
    mutationFn: async ({ 
      currentQuestion,
      answers,
      completed = false,
      score
    }: { 
      currentQuestion: number,
      answers: Record<string, string>,
      completed?: boolean,
      score?: number
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !quizId) throw new Error('User not authenticated or quiz ID missing');
      
      const updateData = {
        quiz_id: quizId,
        user_id: user.id,
        current_question: currentQuestion,
        answers,
        completed_at: completed ? new Date().toISOString() : null,
        score: score,
        last_updated_at: new Date().toISOString()
      };
      
      if (quizProgress) {
        const { error } = await supabase
          .from('user_quiz_progress')
          .update(updateData)
          .eq('id', quizProgress.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('user_quiz_progress')
          .insert({
            ...updateData,
            started_at: new Date().toISOString()
          });
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-quiz-progress'] });
    },
    onError: (error) => {
      console.error('Error updating quiz progress:', error);
      toast.error('Failed to save your progress');
    }
  });

  // Save an answer
  const saveAnswer = (questionId: string, optionId: string) => {
    const newAnswers = { ...currentAnswers, [questionId]: optionId };
    setCurrentAnswers(newAnswers);
    return newAnswers;
  };

  // Update progress
  const updateProgress = async (
    currentQuestion: number, 
    completed = false, 
    score?: number
  ) => {
    try {
      await updateProgressMutation.mutate({
        currentQuestion,
        answers: currentAnswers,
        completed,
        score
      });
      return true;
    } catch (error) {
      return false;
    }
  };

  return {
    quizProgress,
    currentAnswers,
    saveAnswer,
    updateProgress,
    isUpdating: updateProgressMutation.isPending
  };
};
