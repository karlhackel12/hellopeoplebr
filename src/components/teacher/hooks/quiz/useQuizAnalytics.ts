
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface QuizAnalytics {
  totalAttempts: number;
  completionRate: number;
  averageScore: number;
  topQuestions: { questionId: string, questionText: string, correctRate: number }[];
  difficultQuestions: { questionId: string, questionText: string, correctRate: number }[];
  studentPerformance: { studentId: string, name: string, avgScore: number }[];
  passRate: number;
  loading: boolean;
}

export const useQuizAnalytics = (quizId?: string) => {
  const [analytics, setAnalytics] = useState<QuizAnalytics>({
    totalAttempts: 0,
    completionRate: 0,
    averageScore: 0,
    topQuestions: [],
    difficultQuestions: [],
    studentPerformance: [],
    passRate: 0,
    loading: true
  });
  
  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!quizId) {
        setAnalytics(prev => ({ ...prev, loading: false }));
        return;
      }
      
      try {
        // Fetch quiz attempts
        const { data: attempts, error: attemptsError } = await supabase
          .from('user_quiz_attempts')
          .select('*')
          .eq('quiz_id', quizId);
          
        if (attemptsError) throw attemptsError;
        
        // Fetch quiz answers
        const { data: answers, error: answersError } = await supabase
          .from('user_quiz_answers')
          .select(`
            *,
            question:quiz_questions(id, question_text)
          `)
          .eq('quiz_questions.quiz_id', quizId);
          
        if (answersError) throw answersError;
        
        // Calculate analytics
        const totalAttempts = attempts?.length || 0;
        const completedAttempts = attempts?.filter(a => a.completed_at !== null).length || 0;
        const completionRate = totalAttempts > 0 ? (completedAttempts / totalAttempts) * 100 : 0;
        
        // Calculate average score
        const avgScore = attempts && attempts.length > 0
          ? attempts.reduce((sum, attempt) => sum + attempt.score, 0) / attempts.length
          : 0;
          
        // Question performance
        const questionPerformance: Record<string, { correct: number, total: number, text: string }> = {};
        
        if (answers) {
          for (const answer of answers) {
            if (!answer.question) continue;
            
            const questionId = answer.question.id;
            const questionText = answer.question.question_text;
            
            if (!questionPerformance[questionId]) {
              questionPerformance[questionId] = { correct: 0, total: 0, text: questionText };
            }
            
            questionPerformance[questionId].total += 1;
            if (answer.is_correct) {
              questionPerformance[questionId].correct += 1;
            }
          }
        }
        
        // Calculate pass rate
        const passedAttempts = attempts?.filter(a => a.passed).length || 0;
        const passRate = totalAttempts > 0 ? (passedAttempts / totalAttempts) * 100 : 0;
        
        // Process question performance
        const questionStats = Object.entries(questionPerformance).map(([questionId, stats]) => ({
          questionId,
          questionText: stats.text,
          correctRate: stats.total > 0 ? (stats.correct / stats.total) * 100 : 0
        }));
        
        // Top and difficult questions
        const topQuestions = [...questionStats]
          .sort((a, b) => b.correctRate - a.correctRate)
          .slice(0, 3);
          
        const difficultQuestions = [...questionStats]
          .sort((a, b) => a.correctRate - b.correctRate)
          .slice(0, 3);
        
        // Student performance (simplified for now)
        const studentPerformance: { studentId: string, name: string, avgScore: number }[] = [];
        
        if (attempts) {
          const studentScores: Record<string, { totalScore: number, attempts: number }> = {};
          
          for (const attempt of attempts) {
            if (!attempt.user_id) continue;
            
            if (!studentScores[attempt.user_id]) {
              studentScores[attempt.user_id] = { totalScore: 0, attempts: 0 };
            }
            
            studentScores[attempt.user_id].totalScore += attempt.score;
            studentScores[attempt.user_id].attempts += 1;
          }
          
          for (const [studentId, stats] of Object.entries(studentScores)) {
            studentPerformance.push({
              studentId,
              name: `Student ${studentId.substring(0, 4)}`, // This would be replaced with actual names
              avgScore: stats.attempts > 0 ? stats.totalScore / stats.attempts : 0
            });
          }
        }
        
        // Update analytics state
        setAnalytics({
          totalAttempts,
          completionRate,
          averageScore: avgScore,
          topQuestions,
          difficultQuestions,
          studentPerformance,
          passRate,
          loading: false
        });
        
      } catch (error) {
        console.error('Error fetching quiz analytics:', error);
        setAnalytics(prev => ({ ...prev, loading: false }));
      }
    };
    
    fetchAnalytics();
  }, [quizId]);
  
  return analytics;
};
