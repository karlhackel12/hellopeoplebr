
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Question } from '@/components/teacher/quiz/types';

interface UserAnswers {
  [questionId: string]: string;
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
        setUserAnswers(progressData.answers || {});
        setCompleted(progressData.completed || false);
        setScore(progressData.score);
        
        // If the quiz is incomplete, set the current question to the next unanswered one
        if (!progressData.completed) {
          const answeredQuestions = Object.keys(progressData.answers || {}).length;
          setCurrentQuestionIndex(Math.min(answeredQuestions, progressData.total_questions - 1));
        }
      }
    } catch (error) {
      console.error('Error loading quiz progress:', error);
    } finally {
      setLoading(false);
    }
  };

  // Save user's progress to the database
  const saveProgress = async (answers: UserAnswers, isCompleted: boolean = false, finalScore: number | null = null) => {
    try {
      setSaving(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('User not authenticated');
      
      if (progressId) {
        // Update existing progress
        const { error: updateError } = await supabase
          .from('user_quiz_progress')
          .update({
            answers,
            completed: isCompleted,
            score: finalScore,
            updated_at: new Date().toISOString()
          })
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
            completed: isCompleted,
            score: finalScore,
            total_questions: 0, // This will be updated with actual count
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
        const correctOption = question.options.find(option => option.is_correct);
        
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
