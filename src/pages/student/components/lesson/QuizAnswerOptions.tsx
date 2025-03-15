
import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface QuizAnswerOptionsProps {
  options: {
    id: string;
    option_text: string;
  }[];
  currentQuestionId: string;
  selectedAnswerId: string | undefined;
  onSelectAnswer: (optionId: string) => void;
  isSaving: boolean;
}

const QuizAnswerOptions: React.FC<QuizAnswerOptionsProps> = ({
  options,
  currentQuestionId,
  selectedAnswerId,
  onSelectAnswer,
  isSaving
}) => {
  return (
    <div className="space-y-3 my-6">
      {options.map((option) => (
        <Button
          key={option.id}
          variant="outline"
          className={cn(
            "w-full justify-start text-left h-auto py-3 px-4",
            selectedAnswerId === option.id && 
              "bg-primary/10 border-primary/30 text-primary hover:bg-primary/20"
          )}
          onClick={() => onSelectAnswer(option.id)}
          disabled={isSaving}
        >
          {option.option_text}
        </Button>
      ))}
    </div>
  );
};

export default QuizAnswerOptions;
