
import React, { useEffect, useState } from 'react';
import { useQuizHandler } from '../../hooks/useQuizHandler';
import QuizGenerationForm from './QuizGenerationForm';
import QuizPreviewSection from './components/QuizPreviewSection';
import QuizPlaceholder from './QuizPlaceholder';
import { Question } from '@/components/teacher/quiz/types';

interface QuizTabProps {
  lessonId?: string;
  isEditMode?: boolean;
}

const QuizTab: React.FC<QuizTabProps> = ({ lessonId = '', isEditMode = false }) => {
  const [loaded, setLoaded] = useState(false);
  const [quizTitle, setQuizTitle] = useState('');
  const [previewQuestions, setPreviewQuestions] = useState<Question[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [existingQuiz, setExistingQuiz] = useState(false);
  const [isPublished, setIsPublished] = useState(false);
  const [contentLoaded, setContentLoaded] = useState(false);
  const [numQuestions, setNumQuestions] = useState('5');
  
  const {
    fetchQuizDetails,
    fetchQuizQuestions,
    generateQuiz,
    saveQuizTitle,
    deleteQuiz,
    publishQuiz,
    unpublishQuiz,
    loading,
    saving,
    isRetrying,
    error
  } = useQuizHandler(lessonId);

  const loadQuizDetails = async () => {
    try {
      const quiz = await fetchQuizDetails();
      
      if (quiz) {
        setQuizTitle(quiz.title);
        setExistingQuiz(true);
        setIsPublished(quiz.is_published);
        
        // Load questions if quiz exists
        const questions = await fetchQuizQuestions();
        if (questions && questions.length > 0) {
          setPreviewQuestions(questions);
        }
      }
      
      return true;
    } catch (err) {
      console.error('Error loading quiz details:', err);
      return false;
    }
  };

  // Initial data loading
  useEffect(() => {
    const loadInitialData = async () => {
      if (lessonId) {
        await loadQuizDetails();
        setLoaded(true);
      }
    };

    loadInitialData();
  }, [lessonId]);

  if (!lessonId && !isEditMode) {
    return <QuizPlaceholder />;
  }

  // Wrap the handleGenerateQuiz function to make it compatible with Promise<void>
  const handleGenerate = async () => {
    try {
      setShowPreview(false);
      
      const questions = await generateQuiz();
      if (questions && questions.length > 0) {
        setPreviewQuestions(questions);
        setShowPreview(true);
      }
    } catch (err) {
      console.error('Failed to generate quiz:', err);
    }
  };

  const togglePreview = () => {
    setShowPreview(!showPreview);
  };

  const handleSaveQuiz = async () => {
    try {
      await saveQuizTitle(quizTitle);
      setExistingQuiz(true);
      await loadQuizDetails();
    } catch (err) {
      console.error('Failed to save quiz:', err);
    }
  };

  const handleDiscardQuiz = async () => {
    if (existingQuiz) {
      try {
        await deleteQuiz();
        setExistingQuiz(false);
        setShowPreview(false);
        setPreviewQuestions([]);
        setQuizTitle('');
      } catch (err) {
        console.error('Failed to discard quiz:', err);
      }
    } else {
      setShowPreview(false);
      setPreviewQuestions([]);
      setQuizTitle('');
    }
  };
  
  const handleTogglePublish = async () => {
    try {
      if (isPublished) {
        await unpublishQuiz();
      } else {
        await publishQuiz();
      }
      setIsPublished(!isPublished);
    } catch (err) {
      console.error('Failed to toggle publish status:', err);
    }
  };

  return (
    <div className="space-y-8">
      {!showPreview && (
        <QuizGenerationForm
          numQuestions={numQuestions}
          setNumQuestions={setNumQuestions}
          onGenerateQuiz={handleGenerate}
          loading={loading}
          isRetrying={isRetrying}
          error={error}
          errorDetails={null}
          existingQuiz={existingQuiz}
          currentPhase={contentLoaded ? "complete" : "idle"}
        />
      )}
      
      {(previewQuestions.length > 0 || existingQuiz) && (
        <QuizPreviewSection
          previewQuestions={previewQuestions}
          showPreview={showPreview}
          togglePreview={togglePreview}
          quizTitle={quizTitle}
          setQuizTitle={setQuizTitle}
          handleSaveQuiz={handleSaveQuiz}
          handleDiscardQuiz={handleDiscardQuiz}
          saving={saving}
          existingQuiz={existingQuiz}
          isPublished={isPublished}
          onTogglePublish={handleTogglePublish}
        />
      )}
    </div>
  );
};

export default QuizTab;
