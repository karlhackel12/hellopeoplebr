
import React, { useEffect, useState } from 'react';
import { useQuizTabState } from '@/components/teacher/hooks/useQuizTabState';
import QuizGenerationForm from './QuizGenerationForm';
import QuizPreviewSection from './components/QuizPreviewSection';
import QuizPublishAlert from './components/QuizPublishAlert';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader2, RefreshCw } from 'lucide-react';
import QuizGenerationProgress from './components/QuizGenerationProgress';
import { GenerationPhase } from './components/QuizGenerationProgress';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface QuizTabProps {
  lessonId?: string;
  isEditMode: boolean;
}

const QuizTab: React.FC<QuizTabProps> = ({ lessonId, isEditMode }) => {
  const navigate = useNavigate();
  const [initError, setInitError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

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
    errorDetails,
    contentLoadingMessage,
    currentPhase,
    handleGenerateQuiz,
    handleSaveQuiz,
    handleDiscardQuiz,
    togglePublishStatus,
  } = useQuizTabState(lessonId);

  // Add initialization check
  useEffect(() => {
    const checkInitialization = async () => {
      try {
        setIsInitializing(true);
        // Simulate initialization check
        await new Promise(resolve => setTimeout(resolve, 500));
        setIsInitializing(false);
      } catch (error) {
        console.error("Failed to initialize quiz tab:", error);
        setInitError("Failed to initialize quiz component");
        setIsInitializing(false);
      }
    };
    
    checkInitialization();
  }, [lessonId]);

  if (isInitializing) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-muted/30 rounded-lg">
        <Loader2 className="h-6 w-6 animate-spin text-primary mb-2" />
        <p className="text-muted-foreground text-center">
          Initializing quiz editor...
        </p>
      </div>
    );
  }

  if (initError) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-red-50 border border-red-200 rounded-lg">
        <AlertCircle className="h-6 w-6 text-red-500 mb-2" />
        <p className="text-red-700 font-medium mb-2">Error Loading Quiz Editor</p>
        <p className="text-red-600 text-sm mb-4">{initError}</p>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => navigate(-1)}>
            Go Back
          </Button>
          <Button onClick={() => window.location.reload()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

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
      {/* Error alerts */}
      {loadingError && currentPhase !== 'error' && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {loadingError} {errorDetails && <span className="text-xs opacity-80">({errorDetails})</span>}
          </AlertDescription>
        </Alert>
      )}
      
      {/* Loading state */}
      {contentLoadingMessage && currentPhase !== 'idle' && currentPhase !== 'error' && (
        <Alert className="mb-4 bg-blue-50 border-blue-200">
          <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
          <AlertDescription className="text-blue-700">
            {contentLoadingMessage}
          </AlertDescription>
        </Alert>
      )}
      
      {/* Generation progress indicator */}
      {currentPhase !== 'idle' && (
        <QuizGenerationProgress 
          currentPhase={currentPhase as GenerationPhase}
          isRetrying={isRetrying}
          errorMessage={loadingError}
        />
      )}
      
      {/* Quiz generator form */}
      <QuizGenerationForm
        numQuestions={numQuestions}
        setNumQuestions={setNumQuestions}
        onGenerateQuiz={handleGenerateQuiz}
        loading={loading}
        isRetrying={isRetrying}
        error={loadingError}
        errorDetails={errorDetails}
        existingQuiz={existingQuiz}
        currentPhase={currentPhase as GenerationPhase}
      />
      
      {/* Quiz preview section */}
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
      
      {/* Publish reminder */}
      {existingQuiz && !isPublished && <QuizPublishAlert />}
    </div>
  );
};

export default QuizTab;
