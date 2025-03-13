import React, { useState, useEffect } from 'react';
import { useQuizHandler } from '@/components/teacher/hooks/useQuizHandler';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';
import QuizGenerationForm from './QuizGenerationForm';
import QuizPreviewSection from './components/QuizPreviewSection';
import QuizPublishAlert from './components/QuizPublishAlert';
import { GenerationPhase } from './components/QuizGenerationProgress';
import { Question } from '../../quiz/types';

interface QuizTabProps {
  lessonId?: string;
  isEditMode: boolean;
}

const QuizTab: React.FC<QuizTabProps> = ({ lessonId, isEditMode }) => {
  // State
  const [numQuestions, setNumQuestions] = useState('5');
  const [existingQuiz, setExistingQuiz] = useState(false);
  const [isPublished, setIsPublished] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [quizTitle, setQuizTitle] = useState<string>('Lesson Quiz');
  const [previewQuestions, setPreviewQuestions] = useState<Question[]>([]);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const [contentLoadingMessage, setContentLoadingMessage] = useState<string | null>(null);
  const [currentPhase, setCurrentPhase] = useState<GenerationPhase>('idle');

  // Get quiz handler functions
  const {
    generateSmartQuiz,
    fetchQuizQuestions,
    fetchQuizDetails,
    getQuizContent,
    saveQuizTitle,
    deleteQuiz,
    publishQuiz,
    unpublishQuiz,
    loading,
    saving,
    isRetrying: quizHandlerRetrying,
    error: quizError
  } = useQuizHandler(lessonId || '');

  // Effect to sync retry state
  useEffect(() => {
    setIsRetrying(quizHandlerRetrying);
  }, [quizHandlerRetrying]);

  // Clear errors
  const clearErrors = () => {
    setLoadingError(null);
    setErrorDetails(null);
    if (currentPhase === 'error') {
      setCurrentPhase('idle');
    }
  };

  // Set error
  const setError = (message: string, details?: string) => {
    setLoadingError(message);
    setErrorDetails(details || null);
    setCurrentPhase('error');
  };

  // Load quiz preview
  const loadQuizPreview = async (): Promise<Question[] | null> => {
    try {
      if (!existingQuiz) return [];
      
      const questions = await fetchQuizQuestions();
      
      if (questions) {
        setPreviewQuestions(questions);
        return questions;
      } else {
        setError('Failed to load quiz questions');
        return null;
      }
    } catch (error: any) {
      console.error("Error loading quiz preview:", error);
      setError(error.message || 'An unexpected error occurred');
      return null;
    }
  };

  // Reset preview
  const resetPreview = () => {
    setPreviewQuestions([]);
    setQuizTitle('Lesson Quiz');
  };

  // Set generation phase
  const setGenerationPhase = (phase: GenerationPhase) => {
    setCurrentPhase(phase);
    
    // Set appropriate loading message based on phase
    switch (phase) {
      case 'content-loading':
        setContentLoadingMessage('Loading lesson content for analysis...');
        break;
      case 'analyzing':
        setContentLoadingMessage('Analyzing lesson content to identify key concepts...');
        break;
      case 'generating':
        setContentLoadingMessage(isRetrying 
          ? 'Improving quiz questions for better quality...' 
          : 'Generating quiz questions based on content analysis...');
        break;
      case 'saving':
        setContentLoadingMessage('Saving quiz questions to database...');
        break;
      case 'complete':
      case 'idle':
        setContentLoadingMessage(null);
        break;
      case 'error':
        // Keep existing error message
        break;
    }
  };

  // Generate quiz
  const generateQuiz = async (numQuestionsStr: string): Promise<void> => {
    clearErrors();
    setGenerationPhase('content-loading');
    
    try {
      // Load content phase
      const content = await getQuizContent();
      
      if (!content) {
        setError('Could not load content', 'Make sure you have sufficient content before generating a quiz.');
        return;
      }
      
      if (content.length < 100) {
        setError('Content too short', 'You need more content to generate meaningful quiz questions.');
        return;
      }

      // Analyzing phase
      setGenerationPhase('analyzing');
      await new Promise(resolve => setTimeout(resolve, 500)); // Brief delay for UI feedback
      
      // Generation phase
      setGenerationPhase('generating');
      try {
        const numQuestionsInt = parseInt(numQuestionsStr);
        const success = await generateSmartQuiz(numQuestionsInt);
        
        if (success) {
          setGenerationPhase('saving');
          await loadQuizPreview();
          setExistingQuiz(true);
          setIsPublished(false);
          setGenerationPhase('complete');
          
          setTimeout(() => {
            if (currentPhase === 'complete') {
              setGenerationPhase('idle');
            }
          }, 2000);
          
          return;
        } else {
          setError('Failed to generate quiz', 'The quiz generation process failed. Please try again later.');
          return;
        }
      } catch (genError: any) {
        console.error("Error during quiz generation:", genError);
        setError(
          genError.message || 'Quiz generation failed', 
          genError.details || 'An unexpected error occurred during quiz generation.'
        );
        return;
      }
    } catch (error: any) {
      console.error("Error in quiz generation flow:", error);
      setError(
        'Quiz generation error', 
        error.message || 'An unexpected error occurred during the quiz generation process.'
      );
      return;
    }
  };

  // Save quiz
  const handleSaveQuiz = async (): Promise<void> => {
    try {
      await saveQuizTitle(quizTitle);
    } catch (error) {
      console.error("Error saving quiz:", error);
    }
  };

  // Discard quiz
  const handleDiscardQuiz = async (): Promise<void> => {
    try {
      await deleteQuiz();
      resetPreview();
      setExistingQuiz(false);
      setIsPublished(false);
    } catch (error) {
      console.error("Error discarding quiz:", error);
    }
  };

  // Toggle publish status
  const togglePublishStatus = async (): Promise<void> => {
    try {
      if (isPublished) {
        await unpublishQuiz();
        setIsPublished(false);
      } else {
        await publishQuiz();
        setIsPublished(true);
      }
    } catch (error) {
      console.error("Error toggling publish status:", error);
    }
  };

  // Check for existing quiz on mount
  useEffect(() => {
    if (lessonId) {
      const checkExistingQuiz = async () => {
        try {
          setLoadingError(null);
          const quizDetails = await fetchQuizDetails();
          
          if (quizDetails) {
            setExistingQuiz(true);
            setQuizTitle(quizDetails.title);
            setIsPublished(quizDetails.is_published || false);
            
            await loadQuizPreview();
          }
        } catch (error: any) {
          console.error("Error checking existing quiz:", error);
          setLoadingError(error.message);
        }
      };
      
      checkExistingQuiz();
    }
  }, [lessonId]);

  if (!isEditMode || !lessonId) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-muted/30 rounded-lg">
        <p className="text-muted-foreground text-center">
          Save first to enable quiz generation.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
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
        onGenerateQuiz={generateQuiz}
        loading={loading}
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
