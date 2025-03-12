
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useQuizGeneration = (lessonId: string) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);

  const generateQuiz = async (numQuestions: number = 5, optimizedContent?: string): Promise<boolean> => {
    if (!lessonId) {
      toast.error('Missing lesson ID', {
        description: 'Cannot generate quiz without a lesson ID',
      });
      return false;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      let lessonContent = optimizedContent;
      
      // If no optimized content is provided, fetch the raw lesson content
      if (!lessonContent) {
        const { data: lesson, error: lessonError } = await supabase
          .from('lessons')
          .select('content')
          .eq('id', lessonId)
          .single();
        
        if (lessonError || !lesson?.content) {
          console.error('Error fetching lesson content:', lessonError);
          throw new Error(lessonError?.message || 'Failed to fetch lesson content');
        }

        lessonContent = lesson.content;
      }

      if (!lessonContent || lessonContent.length < 50) {
        toast.error('Insufficient lesson content', {
          description: 'The lesson needs more content before generating a quiz.',
        });
        return false;
      }

      console.log('Content length for quiz generation:', lessonContent.length);
      console.log('Number of questions requested:', numQuestions);

      // Call the edge function to generate quiz questions with retry logic
      let attempts = 0;
      const maxAttempts = 2;
      let data;
      let error;

      while (attempts < maxAttempts) {
        try {
          attempts++;
          if (attempts > 1) {
            console.log(`Retrying quiz generation (attempt ${attempts})`);
            setIsRetrying(true);
          }

          const response = await supabase.functions.invoke('generate-quiz', {
            body: { 
              lessonContent,
              numQuestions
            }
          });

          // If successful, break the retry loop
          data = response.data;
          error = response.error;
          
          if (!error) break;
          
          // If we got an error and this is not the last attempt, wait before retrying
          if (attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        } catch (err) {
          console.error(`Error in attempt ${attempts}:`, err);
          error = err;
        }
      }

      setIsRetrying(false);

      if (error) {
        console.error('Edge function error after all attempts:', error);
        throw error;
      }

      // If successful, first check if we already have a quiz for this lesson
      const { data: existingQuiz } = await supabase
        .from('quizzes')
        .select('id')
        .eq('lesson_id', lessonId)
        .maybeSingle();

      let quizId = existingQuiz?.id;

      // If no existing quiz, create a new quiz entry first
      if (!quizId) {
        const { data: user } = await supabase.auth.getUser();
        if (!user.user) throw new Error('User not authenticated');
        
        const { data: newQuiz, error: quizError } = await supabase
          .from('quizzes')
          .insert({
            lesson_id: lessonId,
            title: 'Lesson Quiz',
            created_by: user.user.id,
            is_published: false,
            pass_percent: 70
          })
          .select()
          .single();
        
        if (quizError) throw quizError;
        quizId = newQuiz.id;
      }

      // Now with a valid quizId, batch insert the questions and their options
      if (data?.questions && quizId) {
        // First, remove any existing questions for this quiz
        const { error: deleteError } = await supabase
          .from('quiz_questions')
          .delete()
          .eq('quiz_id', quizId);

        if (deleteError) throw deleteError;

        // Insert new questions
        for (const [index, question] of data.questions.entries()) {
          // Insert question
          const { data: questionData, error: questionError } = await supabase
            .from('quiz_questions')
            .insert({
              quiz_id: quizId,
              question_text: question.question_text,
              question_type: question.question_type,
              points: question.points,
              order_index: index
            })
            .select()
            .single();

          if (questionError) throw questionError;

          // Insert options for this question
          const optionsToInsert = question.options.map((option: any, optionIndex: number) => ({
            question_id: questionData.id,
            option_text: option.option_text,
            is_correct: option.is_correct,
            order_index: optionIndex
          }));

          const { error: optionsError } = await supabase
            .from('quiz_question_options')
            .insert(optionsToInsert);

          if (optionsError) throw optionsError;
        }

        toast.success('Quiz generated successfully', {
          description: `${data.questions.length} questions have been created.`,
        });
        return true;
      }
      
      return false;
    } catch (error: any) {
      console.error('Error generating quiz:', error);
      setError(error.message);
      
      // More descriptive error messages
      if (error.message?.includes('Failed to fetch') || error.code === 'NETWORK_ERROR') {
        toast.error('Network error', {
          description: 'Could not connect to the quiz generation service. Please check your internet connection and try again.',
        });
      } else if (error.status === 429) {
        toast.error('Too many requests', {
          description: 'Quiz generation service is busy. Please wait a moment and try again.',
        });
      } else if (error.status >= 500) {
        toast.error('Server error', {
          description: 'There was a problem with the quiz generation service. Our team has been notified.',
        });
      } else {
        toast.error('Failed to generate quiz', {
          description: error.message || 'An unexpected error occurred',
        });
      }
      
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    generateQuiz,
    loading,
    isRetrying,
    error
  };
};
