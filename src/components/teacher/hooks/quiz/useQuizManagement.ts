import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useQuizManagement = (lessonId: string) => {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const saveQuizTitle = async (quizTitle: string): Promise<boolean> => {
    try {
      setSaving(true);
      setError(null);
      
      if (!lessonId) {
        throw new Error('Lesson ID is required');
      }
      
      // Update the quiz title
      const { error } = await supabase
        .from('quizzes')
        .update({ 
          title: quizTitle,
          updated_at: new Date().toISOString(),
        })
        .eq('lesson_id', lessonId);
        
      if (error) throw error;
      
      toast.success('Quiz updated', {
        description: 'Your quiz has been updated successfully',
      });
      
      return true;
    } catch (error: any) {
      console.error("Error saving quiz:", error);
      setError(error.message);
      toast.error('Save failed', {
        description: 'Failed to save quiz. Please try again.',
      });
      return false;
    } finally {
      setSaving(false);
    }
  };

  const publishQuiz = async (): Promise<boolean> => {
    try {
      setSaving(true);
      setError(null);
      
      if (!lessonId) {
        throw new Error('Lesson ID is required');
      }
      
      // Update the quiz to published
      const { error } = await supabase
        .from('quizzes')
        .update({ 
          is_published: true,
          updated_at: new Date().toISOString(),
        })
        .eq('lesson_id', lessonId);
        
      if (error) throw error;
      
      toast.success('Quiz published', {
        description: 'Your quiz is now published and visible to students',
      });
      
      return true;
    } catch (error: any) {
      console.error("Error publishing quiz:", error);
      setError(error.message);
      toast.error('Publish failed', {
        description: 'Failed to publish quiz. Please try again.',
      });
      return false;
    } finally {
      setSaving(false);
    }
  };

  const unpublishQuiz = async (): Promise<boolean> => {
    try {
      setSaving(true);
      setError(null);
      
      if (!lessonId) {
        throw new Error('Lesson ID is required');
      }
      
      // Update the quiz to unpublished
      const { error } = await supabase
        .from('quizzes')
        .update({ 
          is_published: false,
          updated_at: new Date().toISOString(),
        })
        .eq('lesson_id', lessonId);
        
      if (error) throw error;
      
      toast.success('Quiz unpublished', {
        description: 'Your quiz is now unpublished and hidden from students',
      });
      
      return true;
    } catch (error: any) {
      console.error("Error unpublishing quiz:", error);
      setError(error.message);
      toast.error('Unpublish failed', {
        description: 'Failed to unpublish quiz. Please try again.',
      });
      return false;
    } finally {
      setSaving(false);
    }
  };

  const deleteQuiz = async (): Promise<boolean> => {
    try {
      setSaving(true);
      setError(null);
      
      if (!lessonId) {
        throw new Error('Lesson ID is required');
      }
      
      // First get the quiz ID
      const { data: quiz, error: fetchError } = await supabase
        .from('quizzes')
        .select('id')
        .eq('lesson_id', lessonId)
        .maybeSingle();
          
      if (fetchError) throw fetchError;
      if (!quiz) {
        return true; // Nothing to delete
      }
      
      // Delete the quiz questions first (cascade will delete options)
      const { error: deleteQuestionsError } = await supabase
        .from('quiz_questions')
        .delete()
        .eq('quiz_id', quiz.id);
          
      if (deleteQuestionsError) throw deleteQuestionsError;
      
      // Then delete the quiz
      const { error: deleteQuizError } = await supabase
        .from('quizzes')
        .delete()
        .eq('id', quiz.id);
          
      if (deleteQuizError) throw deleteQuizError;
      
      toast.success('Quiz deleted', {
        description: 'Your quiz has been deleted successfully',
      });
      
      return true;
    } catch (error: any) {
      console.error("Error deleting quiz:", error);
      setError(error.message);
      toast.error('Delete failed', {
        description: 'Failed to delete quiz. Please try again.',
      });
      return false;
    } finally {
      setSaving(false);
    }
  };

  return {
    saveQuizTitle,
    deleteQuiz,
    publishQuiz,
    unpublishQuiz,
    saving,
    error
  };
};
