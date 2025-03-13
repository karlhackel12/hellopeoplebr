
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface QuizAnalytics {
  totalAttempts: number;
  averageScore: number;
  completionRate: number;
  questionDifficulty: {
    questionId: string;
    questionText: string;
    successRate: number;
  }[];
  studentPerformance: {
    studentId: string;
    studentName: string;
    averageScore: number;
    completedQuizzes: number;
  }[];
}

export const useQuizAnalytics = (quizId?: string) => {
  const [analytics, setAnalytics] = useState<QuizAnalytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    if (!quizId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Fetch quiz attempt data
      const { data: attempts, error: attemptsError } = await supabase
        .from('quiz_attempts')
        .select(`
          id,
          score,
          completed,
          created_at,
          student:profiles!quiz_attempts_student_id_fkey(id, full_name)
        `)
        .eq('quiz_id', quizId);
      
      if (attemptsError) throw attemptsError;
      
      // Fetch question performance data
      const { data: questionStats, error: questionsError } = await supabase
        .from('quiz_question_responses')
        .select(`
          id,
          is_correct,
          question:quiz_questions!quiz_question_responses_question_id_fkey(id, question_text)
        `)
        .eq('quiz_id', quizId);
      
      if (questionsError) throw questionsError;
      
      // Process the analytics data
      const totalAttempts = attempts?.length || 0;
      const completedAttempts = attempts?.filter(a => a.completed) || [];
      const completionRate = totalAttempts > 0 
        ? (completedAttempts.length / totalAttempts) * 100 
        : 0;
      
      const totalScore = completedAttempts.reduce((sum, attempt) => sum + (attempt.score || 0), 0);
      const averageScore = completedAttempts.length > 0 
        ? totalScore / completedAttempts.length 
        : 0;
      
      // Process question difficulty data
      const questionMap = new Map();
      questionStats?.forEach(response => {
        const questionId = response.question.id;
        if (!questionMap.has(questionId)) {
          questionMap.set(questionId, {
            id: questionId,
            text: response.question.question_text,
            correct: 0,
            total: 0
          });
        }
        
        const question = questionMap.get(questionId);
        question.total++;
        if (response.is_correct) {
          question.correct++;
        }
      });
      
      const questionDifficulty = Array.from(questionMap.values()).map(q => ({
        questionId: q.id,
        questionText: q.text,
        successRate: q.total > 0 ? (q.correct / q.total) * 100 : 0
      }));
      
      // Process student performance data
      const studentMap = new Map();
      attempts?.forEach(attempt => {
        const studentId = attempt.student?.id;
        if (studentId && !studentMap.has(studentId)) {
          studentMap.set(studentId, {
            studentId,
            studentName: attempt.student?.full_name || 'Unknown',
            totalScore: 0,
            attemptCount: 0,
            completedCount: 0
          });
        }
        
        if (studentId) {
          const student = studentMap.get(studentId);
          student.attemptCount++;
          if (attempt.completed) {
            student.completedCount++;
            student.totalScore += attempt.score || 0;
          }
        }
      });
      
      const studentPerformance = Array.from(studentMap.values()).map(s => ({
        studentId: s.studentId,
        studentName: s.studentName,
        averageScore: s.completedCount > 0 ? s.totalScore / s.completedCount : 0,
        completedQuizzes: s.completedCount
      }));
      
      // Set the analytics data
      setAnalytics({
        totalAttempts,
        averageScore,
        completionRate,
        questionDifficulty,
        studentPerformance
      });
    } catch (err: any) {
      console.error('Error fetching quiz analytics:', err);
      setError(err.message || 'Failed to load quiz analytics');
      toast.error('Failed to load quiz analytics');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (quizId) {
      fetchAnalytics();
    }
  }, [quizId]);
  
  return {
    analytics,
    loading,
    error,
    refreshAnalytics: fetchAnalytics
  };
};
