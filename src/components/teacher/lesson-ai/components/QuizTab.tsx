
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { LessonFormValues } from '../../lesson-editor/useLessonForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Question } from '../../quiz/types';
import { AlertCircle, BookOpen } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import QuizPreview from '../../quiz/QuizPreview';

interface QuizTabProps {
  form: UseFormReturn<LessonFormValues>;
}

const QuizTab: React.FC<QuizTabProps> = ({ form }) => {
  const [quizQuestions, setQuizQuestions] = React.useState<Question[]>([]);
  const [quizTitle, setQuizTitle] = React.useState<string>('Lesson Quiz');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchQuizData = async () => {
      try {
        setLoading(true);
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
        
        // Parse the quiz data
        const parsedData = JSON.parse(quizData);
        if (!parsedData.questions || parsedData.questions.length === 0) {
          return;
        }
        
        // Format questions to match our Question type
        const formattedQuestions: Question[] = parsedData.questions.map((q: any, index: number) => ({
          id: `preview-${index}`,
          question_text: q.question_text,
          question_type: q.question_type || 'multiple_choice',
          points: q.points || 1,
          order_index: index,
          options: q.options?.map((o: any, optIndex: number) => ({
            id: `preview-option-${index}-${optIndex}`,
            option_text: o.option_text,
            is_correct: o.is_correct,
            order_index: optIndex
          }))
        }));
        
        setQuizQuestions(formattedQuestions);
        setQuizTitle(`Quiz: ${form.watch('title')}`);
      } catch (err: any) {
        console.error('Error fetching quiz data:', err);
        setError(err.message || 'Failed to load quiz preview');
      } finally {
        setLoading(false);
      }
    };
    
    fetchQuizData();
  }, [form.watch('title')]);

  if (loading) {
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

  if (quizQuestions.length === 0) {
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
            isPreview={true} 
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default QuizTab;
