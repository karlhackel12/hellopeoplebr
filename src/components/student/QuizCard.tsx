
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { QuestionOption } from '@/components/teacher/quiz/types';
import { CheckCircle, XCircle, ArrowRight, ArrowLeft, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuizCardProps {
  question: string;
  options: QuestionOption[];
  selectedOption?: string;
  onSelectOption: (optionId: string) => void;
  onNextQuestion: () => void;
  onPreviousQuestion?: () => void;
  isLastQuestion?: boolean;
  showCorrectAnswers?: boolean;
  isSubmitted?: boolean;
  explanation?: string;
}

const QuizCard: React.FC<QuizCardProps> = ({
  question,
  options,
  selectedOption,
  onSelectOption,
  onNextQuestion,
  onPreviousQuestion,
  isLastQuestion = false,
  showCorrectAnswers = false,
  isSubmitted = false,
  explanation
}) => {
  return (
    <Card className="border-2 border-primary/20 shadow-md animate-scale-in">
      <CardHeader>
        <CardTitle className="text-lg font-medium">{question}</CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3">
          {options.map((option) => {
            const isSelected = selectedOption === option.id;
            const isCorrect = option.is_correct;
            const showFeedback = showCorrectAnswers && isSubmitted;
            
            return (
              <button
                key={option.id}
                onClick={() => onSelectOption(option.id)}
                disabled={isSubmitted}
                className={cn(
                  "w-full p-4 border-2 rounded-md text-left transition-all flex justify-between items-center",
                  isSelected 
                    ? "border-primary bg-primary/5 ring-2 ring-primary/30" 
                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50",
                  isSubmitted && "cursor-default",
                  showFeedback && isCorrect && "border-green-500 bg-green-50",
                  showFeedback && isSelected && !isCorrect && "border-red-500 bg-red-50"
                )}
                aria-pressed={isSelected}
              >
                <span>{option.option_text}</span>
                
                {showFeedback && (
                  <>
                    {isCorrect && <CheckCircle className="h-5 w-5 text-green-500 shrink-0" />}
                    {isSelected && !isCorrect && <XCircle className="h-5 w-5 text-red-500 shrink-0" />}
                  </>
                )}
                
                {isSelected && !showFeedback && (
                  <span className="h-3 w-3 rounded-full bg-primary shrink-0" />
                )}
              </button>
            );
          })}
          
          {showCorrectAnswers && explanation && (
            <div className="mt-4 p-3 border border-amber-200 bg-amber-50 rounded-md">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                <div className="text-sm text-amber-800">
                  <p className="font-medium mb-1">Explanation:</p>
                  <p>{explanation}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between">
        {onPreviousQuestion ? (
          <Button
            variant="outline"
            onClick={onPreviousQuestion}
            className="gap-2"
            disabled={isSubmitted && !showCorrectAnswers}
          >
            <ArrowLeft className="h-4 w-4" /> Previous
          </Button>
        ) : (
          <div></div>
        )}
        
        <Button
          onClick={onNextQuestion}
          disabled={!selectedOption && !showCorrectAnswers}
          className="gap-2"
        >
          {isLastQuestion 
            ? (showCorrectAnswers ? 'View Results' : 'Submit') 
            : 'Next'}
          <ArrowRight className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default QuizCard;
