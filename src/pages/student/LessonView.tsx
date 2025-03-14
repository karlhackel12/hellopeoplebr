import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, CheckCircle, XCircle, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from "@/components/ui/separator"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';
import { useQuizProgress } from './hooks/useQuizProgress';
import { Question, QuestionOption } from '@/components/teacher/quiz/types';

interface QuizSectionProps {
  questions: Question[];
  quizId: string;
  lessonId: string;
  title: string;
  passPercent: number;
}

const QuizSection: React.FC<QuizSectionProps> = ({ questions, quizId, lessonId, title, passPercent }) => {
  const { toast } = useToast();
  const {
    loading,
    saving,
    currentQuestionIndex,
    userAnswers,
    completed,
    score,
    answerQuestion,
    goToNextQuestion,
    goToPreviousQuestion,
    completeQuiz,
    resetQuiz
  } = useQuizProgress(quizId);

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const hasStarted = Object.keys(userAnswers).length > 0;
  const hasPassed = score !== null && score >= passPercent;

  const handleAnswer = async (optionId: string) => {
    if (!currentQuestion) return;
    
    try {
      const updatedAnswers = await answerQuestion(currentQuestion.id, optionId);
      
      // Optimistically update UI
      // setUserAnswers(updatedAnswers);
      
      // Auto-advance to the next question if not the last question
      if (!isLastQuestion) {
        await goToNextQuestion(questions);
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: error.message || 'Failed to save your answer. Please try again.',
      });
    }
  };

  const handleNext = async () => {
    try {
      await goToNextQuestion(questions);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: error.message || 'Failed to go to the next question. Please try again.',
      });
    }
  };

  const handlePrevious = async () => {
    try {
      await goToPreviousQuestion();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: error.message || 'Failed to go to the previous question. Please try again.',
      });
    }
  };

  const handleSubmit = async () => {
    try {
      const finalScore = await completeQuiz(questions);
      
      if (finalScore !== null) {
        toast({
          title: 'Quiz completed!',
          description: `Your score: ${finalScore}%`,
        });
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: error.message || 'Failed to submit the quiz. Please try again.',
      });
    }
  };

  const handleReset = async () => {
    try {
      await resetQuiz();
      toast({
        description: 'Quiz reset successfully. You can start again.',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: error.message || 'Failed to reset the quiz. Please try again.',
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary/70" />
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No questions available for this quiz.</p>
      </div>
    );
  }

  if (completed) {
    return (
      <div className="text-center py-8">
        {hasPassed ? (
          <>
            <CheckCircle className="h-10 w-10 mx-auto text-green-500 mb-2" />
            <h3 className="text-lg font-semibold">Congratulations!</h3>
            <p className="text-muted-foreground">You passed the quiz with a score of {score}%.</p>
          </>
        ) : (
          <>
            <XCircle className="h-10 w-10 mx-auto text-red-500 mb-2" />
            <h3 className="text-lg font-semibold">Quiz Failed</h3>
            <p className="text-muted-foreground">You scored {score}%, which is below the passing score of {passPercent}%. Please try again.</p>
          </>
        )}
        <Button variant="outline" onClick={handleReset} className="mt-4">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
      <p className="text-muted-foreground">Answer the following questions to test your knowledge.</p>
      
      <div className="border rounded-md bg-secondary">
        <div className="p-4">
          <h3 className="text-lg font-semibold mb-2">Question {currentQuestionIndex + 1}</h3>
          <p className="text-muted-foreground">{currentQuestion?.question_text}</p>
          
          <div className="mt-4 space-y-2">
            {currentQuestion?.options.map((option) => (
              <Button
                key={option.id}
                variant="outline"
                className={cn(
                  "w-full justify-start rounded-md",
                  userAnswers[currentQuestion.id] === option.id && "bg-accent text-accent-foreground hover:bg-accent/80"
                )}
                onClick={() => handleAnswer(option.id)}
                disabled={saving}
              >
                {option.option_text}
              </Button>
            ))}
          </div>
        </div>
      </div>
      
      <div className="flex justify-between">
        <Button variant="secondary" onClick={handlePrevious} disabled={currentQuestionIndex === 0 || saving}>
          Previous
        </Button>
        {isLastQuestion ? (
          <Button onClick={handleSubmit} disabled={saving}>
            Submit Quiz
          </Button>
        ) : (
          <Button onClick={handleNext} disabled={saving}>
            Next
          </Button>
        )}
      </div>
    </div>
  );
};

interface LessonViewProps {
  
}

const LessonView: React.FC = () => {
  const { lessonId } = useParams<{ lessonId: string }>();
  const [expanded, setExpanded] = React.useState<string[]>([]);
  const [isLessonComplete, setIsLessonComplete] = React.useState(false);
  const [quizId, setQuizId] = React.useState<string | null>(null);
  const [quizTitle, setQuizTitle] = React.useState<string | null>(null);
  
  // Fetch lesson content
  const { data: lesson, isLoading: loadingLesson } = useQuery({
    queryKey: ['lesson', lessonId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .eq('id', lessonId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!lessonId,
  });
  
  // Fetch quiz questions
  const { data: quizQuestions, isLoading: loadingQuiz } = useQuery({
    queryKey: ['quiz-questions', lessonId],
    queryFn: async () => {
      const { data: quiz, error: quizError } = await supabase
        .from('quizzes')
        .select('id, title')
        .eq('lesson_id', lessonId)
        .maybeSingle();
      
      if (quizError) throw quizError;
      
      if (!quiz) {
        return [];
      }
      
      setQuizId(quiz.id);
      setQuizTitle(quiz.title);
      
      const { data, error } = await supabase
        .from('quiz_questions')
        .select(`
          *,
          options:quiz_question_options(*)
        `)
        .eq('quiz_id', quiz.id)
        .order('order_index');
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!lessonId,
  });
  
  // Fetch lesson progress
  const { data: lessonProgress, isLoading: loadingProgress } = useQuery({
    queryKey: ['lesson-progress', lessonId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('user_lesson_progress')
        .select('*')
        .eq('lesson_id', lessonId)
        .eq('user_id', user.id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!lessonId,
  });
  
  // Update lesson progress
  const markLessonComplete = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('User not authenticated');
      
      const { error } = await supabase
        .from('user_lesson_progress')
        .upsert({
          lesson_id: lessonId,
          user_id: user.id,
          completed: true,
          last_accessed_at: new Date().toISOString(),
        }, { onConflict: ['lesson_id', 'user_id'] });
      
      if (error) throw error;
      
      setIsLessonComplete(true);
    } catch (error) {
      console.error('Error marking lesson as complete:', error);
    }
  };

  // Helper function to convert quiz data to match Question type
  const formatQuizQuestions = (questions: any[]): Question[] => {
    return questions.map(question => ({
      id: question.id,
      question_text: question.question_text,
      question_type: question.question_type,
      points: question.points,
      order_index: question.order_index || 0,
      options: question.options.map((option: any) => ({
        id: option.id,
        option_text: option.option_text,
        is_correct: option.is_correct || false,
        order_index: option.order_index || 0
      }))
    }));
  };

  // Example quiz questions (replaced with proper formatted questions)
  const exampleQuestions: Question[] = formatQuizQuestions([
    {
      id: '1',
      question_text: 'What is the capital of France?',
      question_type: 'multiple_choice',
      points: 1,
      options: [
        { id: 'a', option_text: 'Paris', is_correct: true },
        { id: 'b', option_text: 'London', is_correct: false },
        { id: 'c', option_text: 'Berlin', is_correct: false },
        { id: 'd', option_text: 'Madrid', is_correct: false }
      ]
    },
    {
      id: '2',
      question_text: 'Which planet is known as the "Red Planet"?',
      question_type: 'multiple_choice',
      points: 1,
      options: [
        { id: 'a', option_text: 'Venus', is_correct: false },
        { id: 'b', option_text: 'Mars', is_correct: true },
        { id: 'c', option_text: 'Jupiter', is_correct: false },
        { id: 'd', option_text: 'Saturn', is_correct: false }
      ]
    }
  ]);

  useEffect(() => {
    if (lessonProgress) {
      setIsLessonComplete(lessonProgress.completed);
    }
  }, [lessonProgress]);

  if (loadingLesson || loadingQuiz || loadingProgress) {
    return (
      <div className="flex justify-center items-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-primary/70" />
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="text-center py-24">
        <h2 className="text-2xl font-semibold">Lesson Not Found</h2>
        <p className="text-muted-foreground">The requested lesson could not be found.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{lesson.title}</h1>
            <p className="text-muted-foreground">Explore and learn</p>
          </div>
          <div>
            {isLessonComplete ? (
              <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                <CheckCircle className="h-4 w-4 mr-2" />
                Completed
              </Badge>
            ) : (
              <Button onClick={markLessonComplete} disabled={isLessonComplete}>
                Mark as Complete
              </Button>
            )}
          </div>
        </div>

        <Separator />

        <Accordion type="multiple" collapsible className="w-full">
          <AccordionItem value="lesson-content">
            <AccordionTrigger>
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                <span>Lesson Content</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div dangerouslySetInnerHTML={{ __html: lesson.content }} />
            </AccordionContent>
          </AccordionItem>
          
          {quizId && (
            <AccordionItem value="quiz-section">
              <AccordionTrigger>
                <div className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  <span>Lesson Quiz</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <QuizSection 
                  questions={quizQuestions.length > 0 ? formatQuizQuestions(quizQuestions) : []} 
                  quizId={quizId || ''}
                  lessonId={lessonId}
                  title={quizTitle || 'Lesson Quiz'}
                  passPercent={70}
                />
              </AccordionContent>
            </AccordionItem>
          )}
        </Accordion>
      </div>
    </div>
  );
};

export default LessonView;
