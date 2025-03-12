
import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface LessonHorizontalNavigatorProps {
  currentPage: number;
  totalPages: number;
  onPrevious: () => void;
  onNext: () => void;
  isFirstPage: boolean;
  isLastPage: boolean;
  completionPercentage: number;
}

const LessonHorizontalNavigator: React.FC<LessonHorizontalNavigatorProps> = ({
  currentPage,
  totalPages,
  onPrevious,
  onNext,
  isFirstPage,
  isLastPage,
  completionPercentage
}) => {
  return (
    <div className="border-t pt-4 mt-6">
      <div className="flex justify-between items-center mb-4">
        <Button 
          variant="outline" 
          onClick={onPrevious}
          disabled={isFirstPage}
          className="flex items-center"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Previous
        </Button>
        
        <div className="text-sm">
          Page {currentPage + 1} of {totalPages}
        </div>
        
        <Button 
          variant={isLastPage ? "default" : "outline"} 
          onClick={onNext}
          disabled={false}
          className="flex items-center"
        >
          {isLastPage ? 'Finish' : 'Next'}
          {!isLastPage && <ChevronRight className="h-4 w-4 ml-1" />}
        </Button>
      </div>
      
      <Progress 
        value={completionPercentage} 
        className="h-2" 
        indicatorClassName={
          completionPercentage === 100 
            ? "bg-green-500" 
            : completionPercentage > 50 
              ? "bg-amber-500" 
              : "bg-primary"
        }
      />
      
      <div className="flex justify-between text-xs text-muted-foreground mt-2">
        <span>Introduction</span>
        <span>Complete</span>
      </div>
    </div>
  );
};

export default LessonHorizontalNavigator;
