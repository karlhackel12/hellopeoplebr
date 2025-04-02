
import React from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Eye, Star, Check, X } from 'lucide-react';
import RecallRatingSystem from './RecallRatingSystem';

interface ReviewQuestionCardProps {
  currentQuestion: any;
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
  if (!currentQuestion) return null;
  
  return (
    <Card className="overflow-hidden mt-6">
      <CardContent className="p-6">
        {/* Question */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <div className="text-sm text-muted-foreground">
              Questão {currentItemIndex + 1} de {totalItems}
            </div>
            {points !== null && (
              <div className="flex items-center text-sm bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                <Star className="h-3.5 w-3.5 mr-1 fill-purple-500" /> +{points} pontos
              </div>
            )}
          </div>
          
          <h3 className="text-lg font-medium mb-4">{currentQuestion.text}</h3>
          
          {/* Options */}
          <div className="space-y-3">
            {currentQuestion.options?.map((option: any) => {
              const isSelected = selectedOption === option.id;
              const isCorrect = option.is_correct;
              
              let className = "border border-input p-4 rounded-lg relative transition-all";
              
              if (!showingAnswer) {
                className += isSelected 
                  ? " bg-primary/5 border-primary" 
                  : " hover:bg-muted/50 cursor-pointer";
              } else {
                if (isCorrect) {
                  className += " bg-green-50 border-green-200";
                } else if (isSelected && !isCorrect) {
                  className += " bg-red-50 border-red-200";
                }
              }
              
              return (
                <div 
                  key={option.id}
                  className={className}
                  onClick={() => !showingAnswer && onSelectOption(option.id)}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-1">{option.text}</div>
                    
                    {showingAnswer && isCorrect && (
                      <div className="bg-green-100 rounded-full p-1">
                        <Check className="h-4 w-4 text-green-600" />
                      </div>
                    )}
                    
                    {showingAnswer && isSelected && !isCorrect && (
                      <div className="bg-red-100 rounded-full p-1">
                        <X className="h-4 w-4 text-red-600" />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Rating System */}
        {showingRating && (
          <div className="mt-8">
            <h4 className="font-medium mb-3">Como você avalia sua recordação?</h4>
            <RecallRatingSystem onRate={onRateRecall} disabled={isSubmitting} />
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between border-t p-4 bg-slate-50">
        <Button 
          variant="outline" 
          onClick={onPrevious}
          disabled={currentItemIndex === 0 || isSubmitting}
        >
          <ChevronLeft className="h-4 w-4 mr-1" /> Anterior
        </Button>
        
        {!showingAnswer && (
          <Button 
            onClick={onShowAnswer}
            className="bg-gradient-to-r from-[#9b87f5] to-[#a794f6] hover:from-[#8b77e5] hover:to-[#9784e6]"
          >
            <Eye className="h-4 w-4 mr-1" /> Ver Resposta
          </Button>
        )}
        
        {showingAnswer && !showingRating && (
          <Button 
            onClick={() => onRateRecall(-1)} 
            className="bg-gradient-to-r from-[#9b87f5] to-[#a794f6] hover:from-[#8b77e5] hover:to-[#9784e6]"
          >
            Avaliar Recordação <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default ReviewQuestionCard;
