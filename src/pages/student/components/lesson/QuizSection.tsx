
import React, { useState } from 'react';
import { useQuizProgress } from '../../hooks/useQuizProgress';
import { Question } from '@/components/teacher/quiz/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import SpacedRepetitionPrompt from './SpacedRepetitionPrompt';
import QuizProgress from './QuizProgress';
import QuizResults from './QuizResults';
import QuizAnswerOptions from './QuizAnswerOptions';
import QuizLoadingState from './QuizLoadingState';
import QuizEmptyState from './QuizEmptyState';

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
  const [showSpacedRepetition, setShowSpacedRepetition] = useState(false);
  
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
  
  // Handle answer selection
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

  // Navigation handlers
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

  // Submit quiz handler
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
        
        setShowSpacedRepetition(true);
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to submit the quiz',
      });
    }
  };

  // Reset quiz handler
  const handleReset = async () => {
    if (!confirm('Are you sure you want to reset the quiz? This will clear all your answers.')) {
      return;
    }
    
    try {
      await resetQuiz();
      toast({
        description: 'Quiz reset successfully',
      });
      setShowSpacedRepetition(false);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to reset the quiz',
      });
    }
  };

  // Render loading state
  if (loading) {
    return <QuizLoadingState />;
  }

  // Render empty state when no questions
  if (questions.length === 0) {
    return <QuizEmptyState />;
  }

  // Render quiz results after completion
  if (completed) {
    return (
      <Card className="border shadow-sm">
        <CardContent className="py-12">
          <QuizResults 
            score={score} 
            passPercent={passPercent} 
            onTryAgain={handleReset} 
          />
        </CardContent>
        
        <SpacedRepetitionPrompt 
          quizId={quizId}
          lessonId={lessonId}
          visible={showSpacedRepetition}
          onClose={() => setShowSpacedRepetition(false)}
        />
      </Card>
    );
  }

  // Render active quiz
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
        <QuizProgress 
          currentIndex={currentQuestionIndex} 
          totalQuestions={questions.length} 
        />
        
        {/* Question */}
        <div className="py-4">
          <h3 className="text-lg font-semibold mb-6">{currentQuestion?.question_text}</h3>
          
          <QuizAnswerOptions 
            options={currentQuestion?.options || []}
            currentQuestionId={currentQuestion?.id || ''}
            selectedAnswerId={userAnswers[currentQuestion?.id || '']}
            onSelectAnswer={handleAnswer}
            isSaving={saving}
          />
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
