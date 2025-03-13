
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Question } from '../quiz/types';

export const useQuizData = (lessonId?: string) => {
  const [quizQuestions, setQuizQuestions] = useState<Question[]>([]);
  const [quizTitle, setQuizTitle] = useState<string>('Lesson Quiz');
  const [quizPassPercent, setQuizPassPercent] = useState<number>(70);
  const [loadingQuiz, setLoadingQuiz] = useState<boolean>(false);
  const [quizExists, setQuizExists] = useState<boolean>(false);
  const [isQuizPublished, setIsQuizPublished] = useState<boolean>(false);

  useEffect(() => {
    const fetchQuizData = async () => {
      if (!lessonId) return;
      
      try {
        setLoadingQuiz(true);
        
        // First check if there's a quiz for this lesson
        const { data: quiz, error: quizError } = await supabase
          .from('quizzes')
          .select('id, title, pass_percent, is_published')
          .eq('lesson_id', lessonId)
          .maybeSingle();
        
        if (quizError) {
          console.error('Error fetching quiz:', quizError);
          return;
        }
        
        if (!quiz) {
          setQuizExists(false);
          return;
        }
        
        setQuizExists(true);
        setQuizTitle(quiz.title);
        setQuizPassPercent(quiz.pass_percent);
        setIsQuizPublished(quiz.is_published);
        
        // Fetch questions for this quiz
        const { data: questions, error: questionsError } = await supabase
          .from('quiz_questions')
          .select(`
            *,
            options:quiz_question_options(*)
          `)
          .eq('quiz_id', quiz.id)
          .order('order_index');
        
        if (questionsError) {
          console.error('Error fetching quiz questions:', questionsError);
          return;
        }
        
        setQuizQuestions(questions || []);
      } catch (error) {
        console.error('Error in quiz data fetch:', error);
      } finally {
        setLoadingQuiz(false);
      }
    };
    
    fetchQuizData();
  }, [lessonId]);

  return {
    quizQuestions,
    quizTitle,
    quizPassPercent,
    loadingQuiz,
    quizExists,
    isQuizPublished
  };
};
