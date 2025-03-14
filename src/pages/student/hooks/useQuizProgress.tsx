
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Question, QuestionOption } from '@/components/teacher/quiz/types';

interface QuizProgressData {
  id?: string;
  quiz_id: string;
  user_id: string;
  current_question: number;
  answers: Record<string, string>;
  started_at?: string;
  completed_at?: string | null;
  score?: number | null;
  last_updated_at?: string;
}

export const useQuizProgress = (quizId: string) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [progressId, setProgressId] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);
  const [score, setScore] = useState<number | null>(null);

  // Load quiz progress
  const loadQuizProgress = async () => {
    try {
      setLoading(true);
      
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');
      
      // Use raw SQL to query the user_quiz_progress table since it might not be registered in TypeScript yet
      const { data, error } = await supabase
        .rpc('get_quiz_progress', { 
          quiz_id_param: quizId,
          user_id_param: user.user.id
        });
      
      if (error) {
        console.error("Error fetching quiz progress:", error);
        // Fallback to directly querying if RPC fails
        const { data: directData, error: directError } = await supabase.from('user_quiz_progress')
          .select('*')
          .eq('quiz_id', quizId)
          .eq('user_id', user.user.id)
          .maybeSingle();
          
        if (directError) throw directError;
        
        if (directData) {
          setProgressId(directData.id);
          setCurrentQuestionIndex(directData.current_question);
          setUserAnswers(directData.answers as Record<string, string>);
          setCompleted(!!directData.completed_at);
          setScore(directData.score);
        } else {
          // Create new progress record
          await createProgress(user.user.id);
        }
      } else if (data) {
        // If RPC succeeded
        setProgressId(data.id);
        setCurrentQuestionIndex(data.current_question);
        setUserAnswers(data.answers as Record<string, string>);
        setCompleted(!!data.completed_at);
        setScore(data.score);
      } else {
        // Create new progress record if no data returned
        await createProgress(user.user.id);
      }
    } catch (error) {
      console.error('Error loading quiz progress:', error);
      toast.error('Failed to load your quiz progress');
    } finally {
      setLoading(false);
    }
  };

  // Create new progress record
  const createProgress = async (userId: string) => {
    try {
      // Use raw SQL to insert into the user_quiz_progress table
      const { data, error } = await supabase
        .rpc('create_quiz_progress', {
          quiz_id_param: quizId,
          user_id_param: userId
        });
      
      if (error) {
        console.error("Error creating quiz progress via RPC:", error);
        // Fallback to direct insert
        const { data: directData, error: directError } = await supabase
          .from('user_quiz_progress')
          .insert({
            quiz_id: quizId,
            user_id: userId,
            current_question: 0,
            answers: {}
          })
          .select()
          .single();
        
        if (directError) throw directError;
        
        setProgressId(directData.id);
      } else if (data && data.id) {
        setProgressId(data.id);
      }
    } catch (error) {
      console.error('Error creating quiz progress:', error);
      toast.error('Failed to initialize quiz');
    }
  };

  // Save current progress
  const saveProgress = async (questionIndex: number, answers: Record<string, string>) => {
    if (!progressId) return;
    
    try {
      setSaving(true);
      
      // Use raw SQL to update the user_quiz_progress table
      const { error } = await supabase
        .rpc('update_quiz_progress', {
          progress_id_param: progressId,
          current_question_param: questionIndex,
          answers_param: answers,
          updated_at_param: new Date().toISOString()
        });
      
      if (error) {
        console.error("Error saving quiz progress via RPC:", error);
        // Fallback to direct update
        const { error: directError } = await supabase
          .from('user_quiz_progress')
          .update({
            current_question: questionIndex,
            answers: answers,
            last_updated_at: new Date().toISOString()
          })
          .eq('id', progressId);
        
        if (directError) throw directError;
      }
      
      setCurrentQuestionIndex(questionIndex);
      setUserAnswers(answers);
    } catch (error) {
      console.error('Error saving quiz progress:', error);
      toast.error('Failed to save your progress');
    } finally {
      setSaving(false);
    }
  };

  // Answer a question
  const answerQuestion = async (questionId: string, optionId: string) => {
    const updatedAnswers = { ...userAnswers, [questionId]: optionId };
    setUserAnswers(updatedAnswers);
    return updatedAnswers;
  };

  // Go to next question
  const goToNextQuestion = async (questions: Question[]) => {
    if (currentQuestionIndex < questions.length - 1) {
      const nextIndex = currentQuestionIndex + 1;
      await saveProgress(nextIndex, userAnswers);
      return nextIndex;
    }
    return currentQuestionIndex;
  };

  // Go to previous question
  const goToPreviousQuestion = async () => {
    if (currentQuestionIndex > 0) {
      const prevIndex = currentQuestionIndex - 1;
      await saveProgress(prevIndex, userAnswers);
      return prevIndex;
    }
    return currentQuestionIndex;
  };

  // Complete the quiz
  const completeQuiz = async (questions: Question[]) => {
    if (!progressId) return;
    
    try {
      setSaving(true);
      
      // Calculate score
      let correctAnswers = 0;
      let totalPoints = 0;
      
      questions.forEach(question => {
        const userAnswer = userAnswers[question.id];
        const correctOption = question.options.find(option => option.is_correct);
        
        if (correctOption && userAnswer === correctOption.id) {
          correctAnswers += question.points;
        }
        
        totalPoints += question.points;
      });
      
      const calculatedScore = Math.round((correctAnswers / totalPoints) * 100);
      
      // Use raw SQL to complete the quiz
      const { error } = await supabase
        .rpc('complete_quiz', {
          progress_id_param: progressId,
          completed_at_param: new Date().toISOString(),
          score_param: calculatedScore,
          updated_at_param: new Date().toISOString()
        });
      
      if (error) {
        console.error("Error completing quiz via RPC:", error);
        // Fallback to direct update
        const { error: directError } = await supabase
          .from('user_quiz_progress')
          .update({
            completed_at: new Date().toISOString(),
            score: calculatedScore,
            last_updated_at: new Date().toISOString()
          })
          .eq('id', progressId);
        
        if (directError) throw directError;
      }
      
      setCompleted(true);
      setScore(calculatedScore);
      
      toast.success('Quiz completed!');
      return calculatedScore;
    } catch (error) {
      console.error('Error completing quiz:', error);
      toast.error('Failed to submit your quiz');
      return null;
    } finally {
      setSaving(false);
    }
  };

  // Reset the quiz
  const resetQuiz = async () => {
    if (!progressId) return;
    
    try {
      setSaving(true);
      
      // Use raw SQL to reset the quiz
      const { error } = await supabase
        .rpc('reset_quiz', {
          progress_id_param: progressId,
          updated_at_param: new Date().toISOString()
        });
      
      if (error) {
        console.error("Error resetting quiz via RPC:", error);
        // Fallback to direct update
        const { error: directError } = await supabase
          .from('user_quiz_progress')
          .update({
            current_question: 0,
            answers: {},
            completed_at: null,
            score: null,
            last_updated_at: new Date().toISOString()
          })
          .eq('id', progressId);
        
        if (directError) throw directError;
      }
      
      setCurrentQuestionIndex(0);
      setUserAnswers({});
      setCompleted(false);
      setScore(null);
      
      toast.success('Quiz reset successfully');
    } catch (error) {
      console.error('Error resetting quiz:', error);
      toast.error('Failed to reset quiz');
    } finally {
      setSaving(false);
    }
  };

  // Load progress on component mount
  useEffect(() => {
    if (quizId) {
      loadQuizProgress();
    }
  }, [quizId]);

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
