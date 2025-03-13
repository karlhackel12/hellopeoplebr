
import React, { useEffect, useState } from 'react';
import { useQuizTabState } from '../../hooks/useQuizTabState';
import QuizGenerationForm from './QuizGenerationForm';
import QuizPreviewSection from './components/QuizPreviewSection';
import QuizPlaceholder from './quiz/QuizPlaceholder';

interface QuizTabProps {
  lessonId?: string;
  isEditMode?: boolean;
}

const QuizTab: React.FC<QuizTabProps> = ({ lessonId = '', isEditMode = false }) => {
  const [loaded, setLoaded] = useState(false);
  const {
    quizTitle,
    setQuizTitle,
    loading,
    saving,
    previewQuestions,
    showPreview,
    togglePreview,
    existingQuiz,
    isPublished,
    contentLoaded,
    contentLoadingMessage,
    isRetrying,
    error,
    handleGenerateQuiz,
    handleSmartGeneration,
    handleGenerateFromLesson,
    handleSaveQuiz,
    handleDiscardQuiz,
    handleTogglePublish,
    loadQuizDetails
  } = useQuizTabState(lessonId, isEditMode);

  // Initial data loading
  useEffect(() => {
    const loadInitialData = async () => {
      if (lessonId) {
        await loadQuizDetails();
        setLoaded(true);
      }
    };

    loadInitialData();
  }, [lessonId, loadQuizDetails]);

  if (!lessonId && !isEditMode) {
    return <QuizPlaceholder />;
  }

  // Wrap the handleGenerateQuiz function to make it compatible with Promise<void>
  const handleGenerate = async () => {
    await handleGenerateQuiz();
    return;
  };

  const handleGenerateFrom = async (setMessage: (msg: string) => void) => {
    const result = await handleGenerateFromLesson(setMessage);
    return result;
  };

  return (
    <div className="space-y-8">
      {!showPreview && (
        <QuizGenerationForm
          onGenerateQuiz={handleGenerate}
          onSmartGeneration={handleSmartGeneration}
          onGenerateFromLesson={handleGenerateFrom}
          loading={loading}
          contentLoaded={contentLoaded}
          contentLoadingMessage={contentLoadingMessage}
          isRetrying={isRetrying}
          error={error}
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
