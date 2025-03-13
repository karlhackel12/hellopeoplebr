import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Quiz, Question } from '../types';

export const useQuizEditor = (quizId?: string, lessonId?: string) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [passPercent, setPassPercent] = useState(70);
  const [isPublished, setIsPublished] = useState(false);

  const fetchQuizData = async () => {
    try {
      setLoading(true);
      
      if (!quizId && !lessonId) {
        setLoading(false);
        return;
      }

      // Fetch quiz
      let quizQuery = supabase.from('quizzes').select('*');
      
      if (quizId) {
        quizQuery = quizQuery.eq('id', quizId);
      } else if (lessonId) {
        quizQuery = quizQuery.eq('lesson_id', lessonId);
      }
      
      const { data: quizData, error: quizError } = await quizQuery.single();
      
      if (quizError && quizError.code !== 'PGRST116') {
        // PGRST116 is the error code for "no rows returned"
        throw quizError;
      }
      
      if (quizData) {
        setQuiz(quizData);
        setTitle(quizData.title);
        setDescription(quizData.description || '');
        setPassPercent(quizData.pass_percent);
        setIsPublished(quizData.is_published);
        
        // Fetch questions for this quiz
        const { data: questionsData, error: questionsError } = await supabase
          .from('quiz_questions')
          .select('*')
          .eq('quiz_id', quizData.id)
          .order('order_index', { ascending: true });
        
        if (questionsError) throw questionsError;
        
        if (questionsData) {
          // For each question, fetch its options
          const questionsWithOptions = await Promise.all(
            questionsData.map(async (question) => {
              const { data: optionsData, error: optionsError } = await supabase
                .from('quiz_question_options')
                .select('*')
                .eq('question_id', question.id)
                .order('order_index', { ascending: true });
              
              if (optionsError) throw optionsError;
              
              return {
                ...question,
                options: optionsData || [],
              };
            })
          );
          
          setQuestions(questionsWithOptions);
        }
      }
    } catch (error) {
      console.error('Error fetching quiz data:', error);
      toast.error('Error', {
        description: 'Failed to load quiz data',
      });
    } finally {
      setLoading(false);
    }
  };

  const saveQuiz = async () => {
    try {
      setSaving(true);
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      if (quiz) {
        // Update existing quiz
        const { error: updateError } = await supabase
          .from('quizzes')
          .update({
            title,
            description,
            pass_percent: passPercent,
            is_published: isPublished,
            updated_at: new Date().toISOString(),
          })
          .eq('id', quiz.id);
        
        if (updateError) throw updateError;
        
        toast.success('Quiz updated', {
          description: 'Your quiz has been successfully updated',
        });
      } else {
        // Create new quiz
        const { data: quizData, error: createError } = await supabase
          .from('quizzes')
          .insert({
            lesson_id: lessonId,
            title,
            description,
            pass_percent: passPercent,
            is_published: isPublished,
            created_by: user.user.id,
          })
          .select();
        
        if (createError) throw createError;
        
        setQuiz(quizData[0]);
        
        toast.success('Quiz created', {
          description: 'Your quiz has been successfully created',
        });
      }
      
      await fetchQuizData(); // Reload quiz data
    } catch (error) {
      console.error('Error saving quiz:', error);
      toast.error('Error', {
        description: 'Failed to save quiz',
      });
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    fetchQuizData();
  }, [quizId, lessonId]);

  return {
    quiz,
    questions,
    title,
    setTitle,
    description,
    setDescription,
    passPercent,
    setPassPercent,
    isPublished,
    setIsPublished,
    loading,
    saving,
    fetchQuizData,
    saveQuiz,
  };
};

export default useQuizEditor;
