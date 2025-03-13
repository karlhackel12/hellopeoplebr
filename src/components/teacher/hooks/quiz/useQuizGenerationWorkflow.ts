
import { useState } from 'react';
import { toast } from 'sonner';
import { GenerationPhase } from '../../lesson/quiz/components/QuizGenerationProgress';

export const useQuizGenerationWorkflow = (
  fetchLessonContent: () => Promise<string | null>,
  generateSmartQuiz: (numQuestions: string) => Promise<boolean>,
  loadQuizPreview: () => Promise<void>,
  setExistingQuiz: (value: boolean) => void,
  setIsPublished: (value: boolean) => void,
  currentPhase: GenerationPhase,
  setGenerationPhase: (phase: GenerationPhase) => void,
  setError: (message: string | null, details?: string) => void,
  clearErrors: () => void,
  setContentLoading: (loading: string | null) => void
) => {
  const [numQuestionsToGenerate, setNumQuestionsToGenerate] = useState<string>('5');

  const generateQuiz = async (numQuestions: string = '5'): Promise<void> => {
    try {
      clearErrors();
      setNumQuestionsToGenerate(numQuestions);
      
      // Step 1: Fetch lesson content
      setContentLoading('Fetching lesson content...');
      setGenerationPhase('content-loading');
      const content = await fetchLessonContent();
      
      if (!content) {
        setError('Failed to fetch lesson content', 'The lesson content could not be retrieved');
        setGenerationPhase('error');
        return;
      }
      
      // Step 2: Generate quiz
      setContentLoading('Generating quiz questions...');
      setGenerationPhase('generating');
      const generated = await generateSmartQuiz(numQuestions);
      
      if (!generated) {
        setError('Failed to generate quiz', 'The quiz generation process encountered an error');
        setGenerationPhase('error');
        return;
      }
      
      // Step 3: Load the preview
      setContentLoading('Preparing quiz preview...');
      setGenerationPhase('saving');
      await loadQuizPreview();
      
      // Mark as existing quiz and set published status
      setExistingQuiz(true);
      setIsPublished(false);
      
      // Completed
      setContentLoading(null);
      setGenerationPhase('complete');
      
      toast.success('Quiz generated successfully', {
        description: `${numQuestions} questions have been created`,
      });
    } catch (error: any) {
      console.error('Error in quiz generation workflow:', error);
      setError('Quiz generation failed', error.message || 'An unexpected error occurred');
      setGenerationPhase('error');
      setContentLoading(null);
    }
  };

  return {
    generateQuiz,
    numQuestionsToGenerate
  };
};
