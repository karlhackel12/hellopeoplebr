
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Question, QuestionOption } from '@/components/teacher/quiz/types';

export const useLessonData = (lessonId: string | undefined) => {
  const queryClient = useQueryClient();

  // Fetch lesson data
  const { data: lesson, isLoading: lessonLoading, error: lessonError } = useQuery({
    queryKey: ['student-lesson', lessonId],
    queryFn: async () => {
      if (!lessonId) throw new Error('Lesson ID is required');
      
      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .eq('id', lessonId)
        .single();
      
      if (error) throw error;
      console.log('Lesson data loaded:', data?.title);
      return data;
    },
    enabled: !!lessonId
  });

  // Fetch quiz data - retrieve any quiz associated with this lesson, regardless of publication status
  const { data: quiz, isLoading: quizLoading, error: quizError } = useQuery({
    queryKey: ['student-lesson-quiz', lessonId],
    queryFn: async () => {
      if (!lessonId) throw new Error('Lesson ID is required');
      
      console.log('Fetching quiz for lesson:', lessonId);
      
      const { data, error } = await supabase
        .from('quizzes')
        .select(`
          id, 
          title, 
          description,
          pass_percent,
          is_published
        `)
        .eq('lesson_id', lessonId)
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching quiz:', error);
        throw error;
      }
      
      console.log('Quiz data loaded:', data ? `${data.title} (published: ${data.is_published})` : 'No quiz found');
      return data;
    },
    enabled: !!lessonId
  });

  // Fetch quiz questions if quiz exists
  const { data: quizQuestions, isLoading: questionsLoading, error: questionsError } = useQuery({
    queryKey: ['student-quiz-questions', quiz?.id],
    queryFn: async () => {
      if (!quiz?.id) throw new Error('Quiz ID is required');
      
      // If quiz is not published, don't try to fetch the questions
      if (!quiz.is_published) {
        console.log('Quiz exists but is not published, skipping questions fetch');
        return [];
      }
      
      console.log('Fetching questions for quiz:', quiz.id);
      
      const { data, error } = await supabase
        .from('quiz_questions')
        .select(`
          id,
          question_text,
          question_type,
          points,
          order_index,
          options:quiz_question_options (
            id,
            option_text,
            is_correct,
            order_index
          )
        `)
        .eq('quiz_id', quiz.id)
        .order('order_index', { ascending: true });
      
      if (error) {
        console.error('Error fetching quiz questions:', error);
        throw error;
      }
      
      console.log('Quiz questions loaded:', data?.length || 0);
      
      // Ensure the data matches the Question type
      const formattedQuestions: Question[] = (data || []).map(q => ({
        id: q.id,
        question_text: q.question_text,
        question_type: q.question_type,
        points: q.points,
        order_index: q.order_index,
        options: q.options.map((option: any) => ({
          id: option.id,
          option_text: option.option_text,
          is_correct: option.is_correct,
          order_index: option.order_index || 0 // Add default value for order_index if it's missing
        }))
      }));
      
      return formattedQuestions;
    },
    enabled: !!quiz?.id && quiz.is_published === true
  });

  const hasErrors = !!lessonError || !!quizError || !!questionsError;
  if (hasErrors) {
    console.error('Errors in useLessonData:', { lessonError, quizError, questionsError });
  }

  // Mark the lesson as viewed to update "Recently Viewed Lessons"
  // This is separate from progress tracking
  const viewLessonMutation = useMutation({
    mutationFn: async () => {
      if (!lessonId) return;
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      // Simply update the last_accessed_at field if a progress record exists
      const { data: existingProgress } = await supabase
        .from('user_lesson_progress')
        .select('id')
        .eq('lesson_id', lessonId)
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (existingProgress) {
        await supabase
          .from('user_lesson_progress')
          .update({ last_accessed_at: new Date().toISOString() })
          .eq('id', existingProgress.id);
      } else {
        // Create a new progress record if none exists
        await supabase
          .from('user_lesson_progress')
          .insert({
            user_id: user.id,
            lesson_id: lessonId,
            last_accessed_at: new Date().toISOString(),
            completed: false
          });
      }
      
      // If there's an assignment, update its status to "in_progress" if it's "not_started"
      const { data: assignment } = await supabase
        .from('student_assignments')
        .select('id, status')
        .eq('lesson_id', lessonId)
        .eq('student_id', user.id)
        .maybeSingle();
      
      if (assignment && assignment.status === 'not_started') {
        await supabase
          .from('student_assignments')
          .update({ 
            status: 'in_progress',
            started_at: new Date().toISOString()
          })
          .eq('id', assignment.id);
        
        console.log('Updated assignment status to in_progress:', assignment.id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-lesson-assignments'] });
      queryClient.invalidateQueries({ queryKey: ['student-recent-lessons'] });
      queryClient.invalidateQueries({ queryKey: ['student-due-assignments'] });
    }
  });

  // Call the viewLesson mutation when the hook is initialized
  React.useEffect(() => {
    if (lessonId && !lessonLoading) {
      viewLessonMutation.mutate();
    }
  }, [lessonId, lessonLoading]);

  return {
    lesson,
    lessonLoading,
    quiz,
    quizLoading,
    quizQuestions: quizQuestions || [],
    questionsLoading,
    hasQuiz: !!quiz && quiz.is_published === true,
    isQuizAvailable: !!quiz && quiz.is_published === true,
    hasUnpublishedQuiz: !!quiz && !quiz.is_published
  };
};
