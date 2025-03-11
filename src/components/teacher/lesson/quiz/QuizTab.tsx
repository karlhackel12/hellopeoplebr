
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { useQuizHandler } from '@/components/teacher/hooks/useQuizHandler';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import QuizGenerationForm from './QuizGenerationForm';
import QuizPreviewHeader from './QuizPreviewHeader';
import QuizPreviewContent from './QuizPreviewContent';
import QuizPlaceholder from './QuizPlaceholder';

interface QuizTabProps {
  lessonId?: string;
  isEditMode: boolean;
}

const QuizTab: React.FC<QuizTabProps> = ({ lessonId, isEditMode }) => {
  const [numQuestions, setNumQuestions] = useState('5');
  const { generateQuiz, loading, fetchQuizQuestions } = useQuizHandler(lessonId || '');
  const [previewQuestions, setPreviewQuestions] = useState([]);
  const [showPreview, setShowPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [quizTitle, setQuizTitle] = useState('Lesson Quiz');
  const [existingQuiz, setExistingQuiz] = useState(false);

  // Check if quiz already exists
  useEffect(() => {
    if (lessonId) {
      const checkExistingQuiz = async () => {
        try {
          const { data, error } = await supabase
            .from('quizzes')
            .select('id, title')
            .eq('lesson_id', lessonId)
            .maybeSingle();
          
          if (data) {
            setExistingQuiz(true);
            setQuizTitle(data.title);
            
            // Fetch existing questions
            const questions = await fetchQuizQuestions();
            if (questions && questions.length > 0) {
              setPreviewQuestions(questions);
              setShowPreview(true);
            }
          }
        } catch (error) {
          console.error("Error checking existing quiz:", error);
        }
      };
      
      checkExistingQuiz();
    }
  }, [lessonId, fetchQuizQuestions]);

  const handleGenerateQuiz = async () => {
    try {
      setShowPreview(false);
      const result = await generateQuiz(parseInt(numQuestions));
      if (result) {
        // Fetch the newly generated questions
        const questions = await fetchQuizQuestions();
        if (questions && questions.length > 0) {
          setPreviewQuestions(questions);
          setShowPreview(true);
          setExistingQuiz(true); // Since we've now created a quiz
          toast.success('Quiz generated', {
            description: 'Your quiz questions have been generated. Review them below.',
          });
        }
      }
    } catch (error) {
      console.error("Error handling quiz generation:", error);
      toast.error('Generation failed', {
        description: 'Failed to generate quiz questions. Please try again.',
      });
    }
  };

  const saveQuiz = async () => {
    try {
      setSaving(true);
      
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
    } catch (error) {
      console.error("Error saving quiz:", error);
      toast.error('Save failed', {
        description: 'Failed to save quiz. Please try again.',
      });
    } finally {
      setSaving(false);
    }
  };

  const discardQuiz = async () => {
    if (existingQuiz && window.confirm('Are you sure you want to delete this quiz? This action cannot be undone.')) {
      try {
        setSaving(true);
        
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
          setExistingQuiz(false);
          setShowPreview(false);
          setPreviewQuestions([]);
          setSaving(false);
          return;
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
        
        setPreviewQuestions([]);
        setExistingQuiz(false);
        setShowPreview(false);
        
        toast.success('Quiz deleted', {
          description: 'Your quiz has been deleted successfully',
        });
      } catch (error) {
        console.error("Error deleting quiz:", error);
        toast.error('Delete failed', {
          description: 'Failed to delete quiz. Please try again.',
        });
      } finally {
        setSaving(false);
      }
    } else if (!existingQuiz) {
      // Just hide the preview for non-saved quizzes
      setShowPreview(false);
      setPreviewQuestions([]);
    }
  };

  const togglePreview = () => {
    setShowPreview(!showPreview);
  };

  return (
    <>
      {isEditMode && lessonId ? (
        <div className="space-y-6">
          {/* AI Generation Section */}
          <QuizGenerationForm
            numQuestions={numQuestions}
            setNumQuestions={setNumQuestions}
            onGenerateQuiz={handleGenerateQuiz}
            loading={loading}
            existingQuiz={existingQuiz}
          />
          
          {/* Quiz Preview Section */}
          {previewQuestions.length > 0 && (
            <Card>
              <QuizPreviewHeader 
                showPreview={showPreview} 
                togglePreview={togglePreview} 
              />
              
              <QuizPreviewContent
                showPreview={showPreview}
                quizTitle={quizTitle}
                setQuizTitle={setQuizTitle}
                previewQuestions={previewQuestions}
                saveQuiz={saveQuiz}
                discardQuiz={discardQuiz}
                saving={saving}
                existingQuiz={existingQuiz}
              />
            </Card>
          )}
        </div>
      ) : (
        <QuizPlaceholder />
      )}
    </>
  );
};

export default QuizTab;
