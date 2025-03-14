
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Question } from '@/components/teacher/quiz/types';

interface UserAnswers {
  [questionId: string]: string;
}

interface QuizProgressRecord {
  id: string;
  quiz_id: string;
  user_id: string;
  answers: UserAnswers;
  completed_at: string | null;
  score: number | null;
  started_at: string;
  last_updated_at: string;
  current_question: number;
}

export const useQuizProgress = (quizId: string) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<UserAnswers>({});
  const [completed, setCompleted] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [progressId, setProgressId] = useState<string | null>(null);

  // Load existing progress when component mounts
  useEffect(() => {
    loadProgress();
  }, [quizId]);

  // Load user's quiz progress from the database
  const loadProgress = async () => {
    try {
      setLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('User not authenticated');
      
      // Check if there's existing progress for this quiz
      const { data: progressData, error: progressError } = await supabase
        .from('user_quiz_progress')
        .select('*')
        .eq('quiz_id', quizId)
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (progressError) throw progressError;
      
      if (progressData) {
        // Load existing progress
        setProgressId(progressData.id);
        
        // Convert answers from JSON to UserAnswers
        const answersObject = progressData.answers as unknown as UserAnswers;
        setUserAnswers(answersObject || {});
        
        // Check if completed based on completed_at
        setCompleted(!!progressData.completed_at);
        setScore(progressData.score);
        
        // If the quiz is incomplete, set the current question to the next unanswered one
        if (!progressData.completed_at) {
          const answeredQuestions = Object.keys(answersObject || {}).length;
          // We don't have total_questions in the database, so use the count of answers as a fallback
          const totalQuestions = await getQuestionCount(quizId);
          setCurrentQuestionIndex(Math.min(answeredQuestions, totalQuestions - 1));
        }
      }
    } catch (error) {
      console.error('Error loading quiz progress:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get the total number of questions for a quiz
  const getQuestionCount = async (quizId: string): Promise<number> => {
    try {
      const { count, error } = await supabase
        .from('quiz_questions')
        .select('*', { count: 'exact', head: true })
        .eq('quiz_id', quizId);
      
      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error('Error counting questions:', error);
      return 0;
    }
  };

  // Save user's progress to the database
  const saveProgress = async (answers: UserAnswers, isCompleted: boolean = false, finalScore: number | null = null) => {
    try {
      setSaving(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('User not authenticated');
      
      const updateData = {
        answers,
        completed_at: isCompleted ? new Date().toISOString() : null,
        score: finalScore,
        updated_at: new Date().toISOString()
      };
      
      if (progressId) {
        // Update existing progress
        const { error: updateError } = await supabase
          .from('user_quiz_progress')
          .update(updateData)
          .eq('id', progressId);
        
        if (updateError) throw updateError;
      } else {
        // Create new progress record
        const { data: newProgress, error: insertError } = await supabase
          .from('user_quiz_progress')
          .insert({
            quiz_id: quizId,
            user_id: user.id,
            answers,
            completed_at: isCompleted ? new Date().toISOString() : null,
            score: finalScore,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single();
        
        if (insertError) throw insertError;
        
        if (newProgress) {
          setProgressId(newProgress.id);
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error saving quiz progress:', error);
      throw error;
    } finally {
      setSaving(false);
    }
  };

  // Record user's answer to a question
  const answerQuestion = async (questionId: string, optionId: string) => {
    try {
      const updatedAnswers = { ...userAnswers, [questionId]: optionId };
      setUserAnswers(updatedAnswers);
      
      await saveProgress(updatedAnswers);
      
      return updatedAnswers;
    } catch (error) {
      console.error('Error answering question:', error);
      throw error;
    }
  };

  // Navigate to the next question
  const goToNextQuestion = async (questions: Question[]) => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  // Navigate to the previous question
  const goToPreviousQuestion = async () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  // Calculate score and complete the quiz
  const completeQuiz = async (questions: Question[]): Promise<number | null> => {
    try {
      setSaving(true);
      
      // Calculate score
      let correctAnswers = 0;
      let totalPoints = 0;
      
      questions.forEach(question => {
        const userAnswer = userAnswers[question.id];
        const correctOption = question.options?.find(option => option.is_correct);
        
        if (userAnswer && correctOption && userAnswer === correctOption.id) {
          correctAnswers += question.points;
        }
        
        totalPoints += question.points;
      });
      
      const finalScore = totalPoints > 0 ? Math.round((correctAnswers / totalPoints) * 100) : 0;
      
      // Update state
      setCompleted(true);
      setScore(finalScore);
      
      // Save to database
      await saveProgress(userAnswers, true, finalScore);
      
      return finalScore;
    } catch (error) {
      console.error('Error completing quiz:', error);
      throw error;
    } finally {
      setSaving(false);
    }
  };

  // Reset the quiz to start over
  const resetQuiz = async () => {
    try {
      setSaving(true);
      
      // Reset state
      setUserAnswers({});
      setCompleted(false);
      setScore(null);
      setCurrentQuestionIndex(0);
      
      // Save to database
      await saveProgress({}, false, null);
      
      return true;
    } catch (error) {
      console.error('Error resetting quiz:', error);
      throw error;
    } finally {
      setSaving(false);
    }
  };

  return {
    loading,
    saving,
    currentQuestionIndex,
    userAnswers,
    completed,
    score,
    answerQuestion,
    goToNextQuestion,
    goToPreviousQuestion,
    completeQuiz,
    resetQuiz
  };
};
