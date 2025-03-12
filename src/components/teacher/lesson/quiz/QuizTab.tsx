
import React from 'react';
import { useQuizTabState } from '@/components/teacher/hooks/useQuizTabState';
import QuizGenerationForm from './QuizGenerationForm';
import QuizPreviewSection from './components/QuizPreviewSection';
import QuizPublishAlert from './components/QuizPublishAlert';
import QuizPlaceholder from './QuizPlaceholder';

interface QuizTabProps {
  lessonId?: string;
  isEditMode: boolean;
}

const QuizTab: React.FC<QuizTabProps> = ({ lessonId, isEditMode }) => {
  const {
    numQuestions,
    setNumQuestions,
    previewQuestions,
    showPreview,
    setShowPreview,
    quizTitle,
    setQuizTitle,
    existingQuiz,
    isPublished,
    loading,
    saving,
    handleGenerateQuiz,
    handleSaveQuiz,
    handleDiscardQuiz,
    togglePublishStatus,
  } = useQuizTabState(lessonId);

  if (!isEditMode || !lessonId) {
    return <QuizPlaceholder />;
  }

  return (
    <div className="space-y-6">
      <QuizGenerationForm
        numQuestions={numQuestions}
        setNumQuestions={setNumQuestions}
        onGenerateQuiz={handleGenerateQuiz}
        loading={loading}
        existingQuiz={existingQuiz}
      />
      
      {previewQuestions.length > 0 && (
        <QuizPreviewSection
          previewQuestions={previewQuestions}
          showPreview={showPreview}
          togglePreview={() => setShowPreview(!showPreview)}
          quizTitle={quizTitle}
          setQuizTitle={setQuizTitle}
          handleSaveQuiz={handleSaveQuiz}
          handleDiscardQuiz={handleDiscardQuiz}
          saving={saving}
          existingQuiz={existingQuiz}
          isPublished={isPublished}
          onTogglePublish={togglePublishStatus}
        />
      )}
      
      {existingQuiz && !isPublished && <QuizPublishAlert />}
    </div>
  );
};

export default QuizTab;
