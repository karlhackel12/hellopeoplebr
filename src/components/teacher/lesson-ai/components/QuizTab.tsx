
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { LessonFormValues } from '../../lesson-editor/useLessonForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Question } from '../../quiz/types';
import { AlertCircle, BookOpen } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import QuizPreview from '../../quiz/QuizPreview';

interface QuizTabProps {
  form?: UseFormReturn<LessonFormValues>;
  lessonId?: string;
  loadingQuiz?: boolean;
  quizExists?: boolean;
  quizQuestions?: Question[];
  quizTitle?: string;
  quizPassPercent?: number;
  isQuizPublished?: boolean;
}

const QuizTab: React.FC<QuizTabProps> = ({ 
  form,
  lessonId,
  loadingQuiz = false,
  quizExists = false,
  quizQuestions = [],
  quizTitle = 'Lesson Quiz',
  quizPassPercent = 70,
  isQuizPublished = false
}) => {
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchQuizData = async () => {
      try {
        setError(null);
        
        // Look for quiz data in localStorage based on recently generated content
        const keys = Object.keys(localStorage).filter(key => key.startsWith('lesson_quiz_'));
        if (keys.length === 0) {
          return;
        }
        
        // Sort by timestamp (newest first)
        keys.sort().reverse();
        const latestKey = keys[0];
        
        const quizData = localStorage.getItem(latestKey);
        if (!quizData) return;

      } catch (err: any) {
        console.error('Error fetching quiz data:', err);
        setError(err.message || 'Failed to load quiz preview');
      }
    };
    
    if (form) {
      fetchQuizData();
    }
  }, [form]);

  if (loadingQuiz) {
    return (
      <div className="flex items-center justify-center h-40">
        <p className="text-muted-foreground">Loading quiz preview...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!quizExists || quizQuestions.length === 0) {
    return (
      <Card className="bg-muted/30">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <BookOpen className="h-12 w-12 text-muted-foreground mb-4 opacity-70" />
            <h3 className="text-lg font-medium mb-2">No Quiz Available</h3>
            <p className="text-muted-foreground max-w-md">
              A quiz hasn't been generated yet for this lesson. After generating lesson content, a quiz should be automatically created.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Quiz Preview</CardTitle>
          <CardDescription>
            Preview the AI-generated quiz questions for this lesson
          </CardDescription>
        </CardHeader>
        <CardContent>
          <QuizPreview 
            questions={quizQuestions} 
            title={quizTitle}
            passPercent={quizPassPercent}
            isPreview={true} 
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default QuizTab;
