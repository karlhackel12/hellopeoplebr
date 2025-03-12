
import { supabase } from '@/integrations/supabase/client';

/**
 * Checks if a quiz already exists for the given lesson
 */
export const getExistingQuiz = async (lessonId: string) => {
  try {
    const { data: existingQuiz } = await supabase
      .from('quizzes')
      .select('id')
      .eq('lesson_id', lessonId)
      .maybeSingle();
      
    return existingQuiz;
  } catch (error) {
    console.error('Error checking existing quiz:', error);
    return null;
  }
};

/**
 * Creates a new quiz entry in the database
 */
export const createNewQuiz = async (lessonId: string) => {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('User not authenticated');
    
    const { data: newQuiz, error: quizError } = await supabase
      .from('quizzes')
      .insert({
        lesson_id: lessonId,
        title: 'Lesson Quiz',
        created_by: user.user.id,
        is_published: false,
        pass_percent: 70
      })
      .select()
      .single();
    
    if (quizError) throw quizError;
    return newQuiz;
  } catch (error) {
    console.error('Error creating new quiz:', error);
    throw error;
  }
};

/**
 * Removes existing questions for a quiz
 */
export const clearExistingQuestions = async (quizId: string) => {
  try {
    const { error } = await supabase
      .from('quiz_questions')
      .delete()
      .eq('quiz_id', quizId);
      
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error clearing existing questions:', error);
    throw error;
  }
};

/**
 * Saves a question and its options to the database
 */
export const saveQuestionWithOptions = async (quizId: string, question: any, index: number) => {
  try {
    // Insert question
    const { data: questionData, error: questionError } = await supabase
      .from('quiz_questions')
      .insert({
        quiz_id: quizId,
        question_text: question.question_text,
        question_type: question.question_type,
        points: question.points,
        order_index: index
      })
      .select()
      .single();

    if (questionError) throw questionError;

    // Insert options for this question
    const optionsToInsert = question.options.map((option: any, optionIndex: number) => ({
      question_id: questionData.id,
      option_text: option.option_text,
      is_correct: option.is_correct,
      order_index: optionIndex
    }));

    const { error: optionsError } = await supabase
      .from('quiz_question_options')
      .insert(optionsToInsert);

    if (optionsError) throw optionsError;
    
    return questionData;
  } catch (error) {
    console.error('Error saving question with options:', error);
    throw error;
  }
};
