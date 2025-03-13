
import { useState } from 'react';
import { toast } from 'sonner';
import { QuizService } from '../../quiz/services/QuizService';
import { QuizGenerationResponse, QuizQuestionData } from '../../quiz/types/quizGeneration';
import { Question } from '../../quiz/types';

export const useQuizDataProcessor = () => {
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);

  /**
   * Process quiz data from the edge function and save to database
   */
  const processQuizData = async (
    lessonId: string,
    generationResponse: QuizGenerationResponse,
    quizTitle: string = 'Lesson Quiz'
  ): Promise<Question[]> => {
    try {
      setProcessing(true);
      setError(null);
      
      if (!generationResponse?.questions || generationResponse.questions.length === 0) {
        throw new Error('No quiz questions were provided in the response');
      }
      
      // Check for partial success with fallback
      if (generationResponse.status === 'failed_with_fallback') {
        toast.warning('Quiz generation partially failed', {
          description: 'Using simplified questions. You may want to regenerate or edit them.'
        });
      }
      
      // Step 1: Check if a quiz already exists for this lesson
      const existingQuiz = await QuizService.getExistingQuiz(lessonId);
      
      // Step 2: Save or update the quiz
      const quiz = await QuizService.saveQuiz(
        lessonId,
        quizTitle,
        existingQuiz?.id
      );
      
      // Step 3: Clear existing questions if any
      if (existingQuiz) {
        await QuizService.clearExistingQuestions(quiz.id);
      }
      
      // Step 4: Save the new questions
      const savedQuestions = await QuizService.saveQuestions(
        quiz.id,
        generationResponse.questions
      );
      
      setQuestions(savedQuestions);
      
      // Log success metrics
      if (generationResponse.processing_stats) {
        console.log('Quiz generation metrics:', generationResponse.processing_stats);
      }
      
      return savedQuestions;
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to process quiz data';
      console.error('Error processing quiz data:', error);
      setError(errorMessage);
      throw error;
    } finally {
      setProcessing(false);
    }
  };

  return {
    processQuizData,
    processing,
    error,
    questions
  };
};
