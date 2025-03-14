
import React from 'react';
import { useQuizProgress } from '../../hooks/useQuizProgress';
import { Question } from '@/components/teacher/quiz/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Loader2, CheckCircle, XCircle, Award } from 'lucide-react';

interface QuizSectionProps {
  questions: Question[];
  quizId: string;
  lessonId: string;
  title: string;
  passPercent: number;
}

const QuizSection: React.FC<QuizSectionProps> = ({ 
  questions, 
  quizId, 
  lessonId, 
  title, 
  passPercent 
}) => {
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
  const isFirstQuestion = currentQuestionIndex === 0;
  const hasStarted = Object.keys(userAnswers).length > 0;
  const hasPassed = score !== null && score >= passPercent;
  
  // Calculate progress percentage
  const progressPercentage = questions.length > 0 
    ? Math.round((currentQuestionIndex + 1) / questions.length * 100) 
    : 0;

  const handleAnswer = async (optionId: string) => {
    if (!currentQuestion) return;
    
    try {
      await answerQuestion(currentQuestion.id, optionId);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to save your answer',
      });
    }
  };

  const handleNext = async () => {
    try {
      await goToNextQuestion(questions);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to go to the next question',
      });
    }
  };

  const handlePrevious = async () => {
    try {
      await goToPreviousQuestion();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to go to the previous question',
      });
    }
  };

  const handleSubmit = async () => {
    if (!confirm('Are you sure you want to submit your quiz? You won\'t be able to change your answers after submission.')) {
      return;
    }
    
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
        title: 'Error',
        description: error.message || 'Failed to submit the quiz',
      });
    }
  };

  const handleReset = async () => {
    if (!confirm('Are you sure you want to reset the quiz? This will clear all your answers.')) {
      return;
    }
    
    try {
      await resetQuiz();
      toast({
        description: 'Quiz reset successfully',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to reset the quiz',
      });
    }
  };

  if (loading) {
    return (
      <Card className="border shadow-sm">
        <CardContent className="flex justify-center items-center py-12">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary/70" />
            <p className="text-muted-foreground">Loading quiz data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (questions.length === 0) {
    return (
      <Card className="border shadow-sm">
        <CardContent className="py-12">
          <div className="text-center">
            <p className="text-muted-foreground">No questions available for this quiz.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Quiz results view (after completion)
  if (completed) {
    return (
      <Card className="border shadow-sm">
        <CardContent className="py-12">
          <div className="text-center space-y-6">
            {hasPassed ? (
              <>
                <CheckCircle className="h-16 w-16 mx-auto text-green-500 mb-2" />
                <h3 className="text-2xl font-semibold">Congratulations!</h3>
                <p className="text-lg">You passed the quiz with a score of {score}%</p>
                <div className="w-1/2 mx-auto my-6">
                  <Progress value={score || 0} className="h-3" indicatorClassName="bg-green-500" />
                </div>
                <Award className="h-12 w-12 mx-auto text-amber-500 mb-2" />
              </>
            ) : (
              <>
                <XCircle className="h-16 w-16 mx-auto text-red-500 mb-2" />
                <h3 className="text-2xl font-semibold">Quiz Failed</h3>
                <p className="text-lg">
                  You scored {score}%, which is below the passing score of {passPercent}%
                </p>
                <div className="w-1/2 mx-auto my-6">
                  <Progress value={score || 0} className="h-3" indicatorClassName="bg-red-500" />
                </div>
                <p>Don't worry! You can try again.</p>
              </>
            )}
            
            <Button 
              variant="outline" 
              onClick={handleReset} 
              className="mt-4"
            >
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Quiz active view (during quiz-taking)
  return (
    <Card className="border shadow-sm">
      <CardHeader className="pb-3 border-b">
        <CardTitle className="text-xl flex items-center justify-between">
          <span>{title}</span>
          <span className="text-sm font-normal text-muted-foreground">
            Question {currentQuestionIndex + 1} of {questions.length}
          </span>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-6">
        {/* Progress bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-muted-foreground mb-2">
            <span>Progress</span>
            <span>{progressPercentage}%</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>
        
        {/* Question */}
        <div className="py-4">
          <h3 className="text-lg font-semibold mb-6">{currentQuestion?.question_text}</h3>
          
          <div className="space-y-3 my-6">
            {currentQuestion?.options.map((option) => (
              <Button
                key={option.id}
                variant="outline"
                className={cn(
                  "w-full justify-start text-left h-auto py-3 px-4",
                  userAnswers[currentQuestion.id] === option.id && 
                    "bg-primary/10 border-primary/30 text-primary hover:bg-primary/20"
                )}
                onClick={() => handleAnswer(option.id)}
                disabled={saving}
              >
                {option.option_text}
              </Button>
            ))}
          </div>
        </div>
        
        {/* Navigation buttons */}
        <div className="flex justify-between pt-4 border-t mt-6">
          <Button 
            variant="outline" 
            onClick={handlePrevious} 
            disabled={isFirstQuestion || saving}
          >
            Previous
          </Button>
          
          {isLastQuestion ? (
            <Button 
              onClick={handleSubmit} 
              disabled={saving || !userAnswers[currentQuestion?.id]}
              className="bg-green-600 hover:bg-green-700"
            >
              Submit Quiz
            </Button>
          ) : (
            <Button 
              onClick={handleNext} 
              disabled={saving || !userAnswers[currentQuestion?.id]}
            >
              Next
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default QuizSection;
