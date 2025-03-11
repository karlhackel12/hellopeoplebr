
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { useQuizHandler } from '@/components/teacher/hooks/useQuizHandler';
import { toast } from 'sonner';
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
  const { 
    generateQuiz, 
    fetchQuizQuestions, 
    fetchQuizDetails,
    saveQuizTitle,
    deleteQuiz,
    loading, 
    saving 
  } = useQuizHandler(lessonId || '');
  
  const [previewQuestions, setPreviewQuestions] = useState([]);
  const [showPreview, setShowPreview] = useState(false);
  const [quizTitle, setQuizTitle] = useState('Lesson Quiz');
  const [existingQuiz, setExistingQuiz] = useState(false);

  // Check if quiz already exists
  useEffect(() => {
    if (lessonId) {
      const checkExistingQuiz = async () => {
        try {
          const quizDetails = await fetchQuizDetails();
          
          if (quizDetails) {
            setExistingQuiz(true);
            setQuizTitle(quizDetails.title);
            
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
  }, [lessonId, fetchQuizQuestions, fetchQuizDetails]);

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

  const handleSaveQuiz = async () => {
    await saveQuizTitle(quizTitle);
  };

  const handleDiscardQuiz = async () => {
    if (existingQuiz && window.confirm('Are you sure you want to delete this quiz? This action cannot be undone.')) {
      const success = await deleteQuiz();
      if (success) {
        setPreviewQuestions([]);
        setExistingQuiz(false);
        setShowPreview(false);
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
                saveQuiz={handleSaveQuiz}
                discardQuiz={handleDiscardQuiz}
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
