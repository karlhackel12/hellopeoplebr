
import React, { useState, useEffect } from 'react';
import { useQuizTabState } from '@/components/teacher/hooks/useQuizTabState';
import QuizGenerationForm from './QuizGenerationForm';
import QuizPreviewSection from './components/QuizPreviewSection';
import QuizPublishAlert from './components/QuizPublishAlert';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';
import { QuizService } from '../quiz/services/QuizService';
import { toast } from 'sonner';

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
    errorDetails,
    contentLoadingMessage,
    currentPhase,
    handleGenerateQuiz,
    handleSaveQuiz,
    handleDiscardQuiz,
    togglePublishStatus,
  } = useQuizTabState(lessonId);

  const [retrievingQuizData, setRetrievingQuizData] = useState<boolean>(false);
  const [retrieveError, setRetrieveError] = useState<string | null>(null);

  // Check if there's stored quiz data that hasn't been saved yet
  useEffect(() => {
    if (!isEditMode || !lessonId || existingQuiz || loading || previewQuestions.length > 0) {
      return;
    }

    const checkStoredQuizData = async () => {
      try {
        setRetrievingQuizData(true);
        setRetrieveError(null);
        
        // Try to get the most recent quiz key from localStorage
        const mostRecentQuizKey = localStorage.getItem('most_recent_quiz_key');
        
        // If no key was found, check all keys starting with lesson_quiz_
        const quizKeys = mostRecentQuizKey 
          ? [mostRecentQuizKey] 
          : Object.keys(localStorage).filter(key => key.startsWith('lesson_quiz_'));
        
        if (quizKeys.length === 0) {
          console.log('No stored quiz data found in localStorage');
          setRetrievingQuizData(false);
          return;
        }
        
        // Use the most recent quiz data (sort by timestamp in key)
        quizKeys.sort().reverse();
        const latestKey = quizKeys[0];
        
        const quizData = localStorage.getItem(latestKey);
        if (!quizData) {
          setRetrievingQuizData(false);
          return;
        }
        
        console.log(`Retrieved quiz data from localStorage key: ${latestKey}`);
        const parsedQuizData = JSON.parse(quizData);
        
        if (parsedQuizData && parsedQuizData.questions && parsedQuizData.questions.length > 0) {
          // Check if this quiz has already been saved for this lesson
          const quizDetails = await QuizService.getExistingQuiz(lessonId);
          
          if (!quizDetails) {
            // Auto-import the quiz data
            setQuizTitle('Lesson Quiz');
            handleGenerateQuiz('auto-import', parsedQuizData.questions);
            toast.info("Quiz data found", {
              description: "AI-generated quiz questions have been loaded from your lesson generation"
            });
          }
        }
      } catch (error) {
        console.error('Error retrieving stored quiz data:', error);
        setRetrieveError('Failed to retrieve quiz data');
      } finally {
        setRetrievingQuizData(false);
      }
    };

    checkStoredQuizData();
  }, [lessonId, isEditMode, existingQuiz, loading, previewQuestions.length]);

  if (!isEditMode || !lessonId) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-muted/30 rounded-lg">
        <p className="text-muted-foreground text-center">
          Save the lesson first to enable quiz generation.
        </p>
      </div>
    );
  }

  const onGenerateQuiz = (numQuestionsParam: string, existingQuestions?: any[]) => {
    // Convert numQuestions to a number before passing
    handleGenerateQuiz(numQuestionsParam, existingQuestions);
  };

  return (
    <div className="space-y-6">
      {retrieveError && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{retrieveError}</AlertDescription>
        </Alert>
      )}
      
      {retrievingQuizData && (
        <Alert className="mb-4 bg-blue-50 border-blue-200">
          <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
          <AlertDescription className="text-blue-700">
            Checking for available quiz data...
          </AlertDescription>
        </Alert>
      )}
      
      {loadingError && currentPhase !== 'error' && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {loadingError} {errorDetails && <span className="text-xs opacity-80">({errorDetails})</span>}
          </AlertDescription>
        </Alert>
      )}
      
      {contentLoadingMessage && currentPhase !== 'idle' && currentPhase !== 'error' && (
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
        onGenerateQuiz={onGenerateQuiz}
        loading={loading || retrievingQuizData}
        isRetrying={isRetrying}
        error={loadingError}
        errorDetails={errorDetails}
        existingQuiz={existingQuiz}
        currentPhase={currentPhase}
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
