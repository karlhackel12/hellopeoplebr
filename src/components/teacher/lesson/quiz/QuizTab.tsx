
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { useQuizHandler } from '@/components/teacher/hooks/useQuizHandler';
import { toast } from 'sonner';
import QuizGenerationForm from './QuizGenerationForm';
import QuizPreviewHeader from './QuizPreviewHeader';
import QuizPreviewContent from './QuizPreviewContent';
import QuizPlaceholder from './QuizPlaceholder';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

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
    publishQuiz,
    unpublishQuiz,
    loading, 
    saving 
  } = useQuizHandler(lessonId || '');
  
  const [previewQuestions, setPreviewQuestions] = useState([]);
  const [showPreview, setShowPreview] = useState(false);
  const [quizTitle, setQuizTitle] = useState('Lesson Quiz');
  const [existingQuiz, setExistingQuiz] = useState(false);
  const [isPublished, setIsPublished] = useState(false);

  // Check if quiz already exists
  useEffect(() => {
    if (lessonId) {
      const checkExistingQuiz = async () => {
        try {
          const quizDetails = await fetchQuizDetails();
          
          if (quizDetails) {
            setExistingQuiz(true);
            setQuizTitle(quizDetails.title);
            setIsPublished(quizDetails.is_published || false);
            
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
    if (!lessonId) {
      toast.error('Missing lesson', {
        description: 'Please save the lesson before generating a quiz.',
      });
      return;
    }
    
    try {
      setShowPreview(false);
      console.log("Generating quiz with", parseInt(numQuestions), "questions");
      
      const result = await generateQuiz(parseInt(numQuestions));
      console.log("Quiz generation result:", result);
      
      if (result) {
        // Fetch the newly generated questions
        const questions = await fetchQuizQuestions();
        console.log("Fetched questions:", questions);
        
        if (questions && questions.length > 0) {
          setPreviewQuestions(questions);
          setShowPreview(true);
          setExistingQuiz(true); // Since we've now created a quiz
          setIsPublished(false); // New quizzes are unpublished by default
          toast.success('Quiz generated', {
            description: 'Your quiz questions have been generated. Review them below.',
          });
        } else {
          toast.error('No questions generated', {
            description: 'The quiz was created but no questions were generated. Please try again.',
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
    toast.success('Quiz saved', {
      description: 'Your quiz has been saved successfully.',
    });
  };

  const handleDiscardQuiz = async () => {
    if (existingQuiz && window.confirm('Are you sure you want to delete this quiz? This action cannot be undone.')) {
      const success = await deleteQuiz();
      if (success) {
        setPreviewQuestions([]);
        setExistingQuiz(false);
        setShowPreview(false);
        setIsPublished(false);
        toast.success('Quiz deleted', {
          description: 'Your quiz has been deleted successfully.',
        });
      }
    } else if (!existingQuiz) {
      // Just hide the preview for non-saved quizzes
      setShowPreview(false);
      setPreviewQuestions([]);
    }
  };

  const togglePublishStatus = async () => {
    if (!existingQuiz) {
      toast.error('Save quiz first', {
        description: 'You need to save the quiz before publishing it.',
      });
      return;
    }

    try {
      if (isPublished) {
        const success = await unpublishQuiz();
        if (success) {
          setIsPublished(false);
          toast.success('Quiz unpublished', {
            description: 'Your quiz is now hidden from students.',
          });
        }
      } else {
        const success = await publishQuiz();
        if (success) {
          setIsPublished(true);
          toast.success('Quiz published', {
            description: 'Your quiz is now visible to students.',
          });
        }
      }
    } catch (error) {
      console.error("Error toggling publish status:", error);
      toast.error('Action failed', {
        description: 'Failed to change publish status. Please try again.',
      });
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
              
              {existingQuiz && (
                <div className="px-6 py-2 border-b flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant={isPublished ? "default" : "outline"}>
                      {isPublished ? "Published" : "Draft"}
                    </Badge>
                    <p className="text-sm text-muted-foreground">
                      {isPublished 
                        ? "This quiz is visible to students" 
                        : "This quiz is only visible to teachers"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="publish-toggle" className="text-sm">
                      {isPublished ? "Published" : "Draft"}
                    </Label>
                    <Switch 
                      id="publish-toggle" 
                      checked={isPublished} 
                      onCheckedChange={togglePublishStatus}
                      disabled={saving}
                    />
                  </div>
                </div>
              )}
              
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
          
          {existingQuiz && !isPublished && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                This quiz is in draft mode and won't be visible to students. Publish it when you're ready for students to take it.
              </AlertDescription>
            </Alert>
          )}
        </div>
      ) : (
        <QuizPlaceholder />
      )}
    </>
  );
};

export default QuizTab;
