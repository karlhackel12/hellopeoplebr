import React, { useMemo, useCallback, Suspense, lazy } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Timer, ArrowLeft, ArrowRight, Check, X } from 'lucide-react';

// Lazy load RecallRatingSystem
const RecallRatingSystem = lazy(() => import('./RecallRatingSystem'));

interface Option {
  id: string;
  option_text: string;
  is_correct: boolean;
}

interface Question {
  question_text: string;
  options: Option[];
}

interface ReviewQuestionCardProps {
  currentQuestion: Question | null;
  selectedOption: string | null;
  showingAnswer: boolean;
  showingRating: boolean;
  isSubmitting: boolean;
  currentItemIndex: number;
  totalItems: number;
  points: number | null;
  onSelectOption: (optionId: string) => void;
  onShowAnswer: () => void;
  onRateRecall: (rating: number) => void;
  onPrevious: () => void;
}

const ReviewQuestionCard: React.FC<ReviewQuestionCardProps> = ({
  currentQuestion,
  selectedOption,
  showingAnswer,
  showingRating,
  isSubmitting,
  currentItemIndex,
  totalItems,
  points,
  onSelectOption,
  onShowAnswer,
  onRateRecall,
  onPrevious
}) => {
  const handleOptionClick = useCallback((optionId: string) => {
    if (!showingAnswer && !showingRating) {
      onSelectOption(optionId);
    }
  }, [showingAnswer, showingRating, onSelectOption]);

  const optionButtons = useMemo(() => {
    return currentQuestion?.options?.map((option) => (
      <Button
        key={option.id}
        variant={
          showingAnswer 
            ? option.is_correct 
              ? "outline" 
              : selectedOption === option.id 
                ? "outline" 
                : "ghost"
            : "outline"
        }
        className={`w-full justify-start text-left h-auto py-3 px-4 ${
          showingAnswer && (
            option.is_correct 
              ? "border-green-500 bg-green-50" 
              : selectedOption === option.id 
                ? "border-red-500 bg-red-50"
                : ""
          )
        }`}
        onClick={() => handleOptionClick(option.id)}
        disabled={showingAnswer}
      >
        {option.option_text}
        
        {showingAnswer && option.is_correct && (
          <Check className="ml-auto h-5 w-5 text-green-500" />
        )}
        
        {showingAnswer && !option.is_correct && selectedOption === option.id && (
          <X className="ml-auto h-5 w-5 text-red-500" />
        )}
      </Button>
    ));
  }, [currentQuestion, showingAnswer, selectedOption, handleOptionClick]);

  const footerContent = useMemo(() => (
    <div className="flex justify-between items-center w-full">
      {currentItemIndex > 0 ? (
        <Button 
          variant="outline" 
          onClick={onPrevious}
          disabled={showingRating || isSubmitting}
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Previous
        </Button>
      ) : (
        <div></div>
      )}
      
      {!showingAnswer && !showingRating && (
        <Button 
          variant="outline" 
          onClick={onShowAnswer}
        >
          Show Answer
        </Button>
      )}
      
      {showingAnswer && !showingRating && (
        <Button 
          variant="default" 
          onClick={() => onRateRecall(-1)}
        >
          Rate Recall <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      )}
    </div>
  ), [currentItemIndex, showingAnswer, showingRating, isSubmitting, onPrevious, onShowAnswer, onRateRecall]);

  return (
    <Card className="mx-auto max-w-2xl">
      <CardContent className="p-6">
        {currentQuestion ? (
          <div>
            <h3 className="text-xl font-medium mb-6">{currentQuestion.question_text}</h3>
            
            <div className="space-y-3 my-6">
              {optionButtons}
            </div>
            
            {showingRating && (
              <Suspense fallback={<div className="animate-pulse h-12 bg-gray-200 rounded"></div>}>
                <RecallRatingSystem 
                  onRateRecall={onRateRecall} 
                  isSubmitting={isSubmitting} 
                />
              </Suspense>
            )}
            
            {!showingAnswer && !showingRating && (
              <div className="flex justify-end">
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Timer className="h-4 w-4" />
                  <span>Time recorded for scoring</span>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="py-12 text-center">
            <p>No question data available.</p>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="bg-slate-50 border-t px-6 py-4">
        {footerContent}
      </CardFooter>
    </Card>
  );
};

export default React.memo(ReviewQuestionCard);
