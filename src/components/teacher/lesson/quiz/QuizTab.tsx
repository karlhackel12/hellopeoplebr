
import React from 'react';
import { useQuizTabState } from '@/components/teacher/hooks/useQuizTabState';
import QuizGenerationForm from './QuizGenerationForm';
import QuizPreviewSection from './components/QuizPreviewSection';
import QuizPublishAlert from './components/QuizPublishAlert';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';

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
    isRetrying,
    loadingError,
    contentLoadingMessage,
    handleGenerateQuiz,
    handleSaveQuiz,
    handleDiscardQuiz,
    togglePublishStatus,
  } = useQuizTabState(lessonId);

  // Handle toggle publish status with boolean return
  const handleTogglePublish = async () => {
    await togglePublishStatus();
  };

  if (!isEditMode || !lessonId) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-muted/30 rounded-lg">
        <p className="text-muted-foreground text-center">
          Save the lesson first to enable quiz generation.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {loadingError && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            There was an issue connecting to the quiz service. You can try again or refresh the page.
          </AlertDescription>
        </Alert>
      )}
      
      {contentLoadingMessage && (
        <Alert className="mb-4 bg-blue-50 border-blue-200">
          <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
          <AlertDescription className="text-blue-700">
            {contentLoadingMessage}
          </AlertDescription>
        </Alert>
      )}
      
      <QuizGenerationForm
        numQuestions={numQuestions}
        setNumQuestions={setNumQuestions}
        onGenerateQuiz={handleGenerateQuiz}
        loading={loading}
        isRetrying={isRetrying}
        error={loadingError}
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
          onTogglePublish={handleTogglePublish}
        />
      )}
      
      {existingQuiz && !isPublished && <QuizPublishAlert />}
    </div>
  );
};

export default QuizTab;
