
import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useIsMobile } from '@/hooks/use-mobile';

interface LessonHorizontalNavigatorProps {
  currentPage: number;
  totalPages: number;
  onPrevious: () => void;
  onNext: () => void;
  isFirstPage: boolean;
  isLastPage: boolean;
  completionPercentage: number;
  isReviewMode?: boolean;
}

const LessonHorizontalNavigator: React.FC<LessonHorizontalNavigatorProps> = ({
  currentPage,
  totalPages,
  onPrevious,
  onNext,
  isFirstPage,
  isLastPage,
  completionPercentage,
  isReviewMode = false
}) => {
  const isMobile = useIsMobile();
  
  return (
    <div className="border-t pt-4 mt-6">
      <div className="flex justify-between items-center mb-4">
        <Button 
          variant="outline" 
          onClick={onPrevious}
          disabled={isFirstPage}
          className={`flex items-center ${isMobile ? 'text-xs px-2 py-1 h-8' : ''}`}
          size={isMobile ? "sm" : "default"}
        >
          <ChevronLeft className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'} mr-1`} />
          {isMobile ? 'Prev' : 'Previous'}
        </Button>
        
        <div className={`text-sm ${isMobile ? 'text-xs mx-1' : 'mx-2'}`}>
          Page {currentPage + 1} of {totalPages}
        </div>
        
        <Button 
          variant={isLastPage ? "default" : "outline"} 
          onClick={onNext}
          disabled={false}
          className={`flex items-center ${isMobile ? 'text-xs px-2 py-1 h-8' : ''}`}
          size={isMobile ? "sm" : "default"}
        >
          {isLastPage ? 'Finish' : 'Next'}
          {!isLastPage && <ChevronRight className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'} ml-1`} />}
        </Button>
      </div>
      
      <Progress 
        value={completionPercentage} 
        className="h-1" 
        indicatorClassName={
          completionPercentage === 100 
            ? "bg-green-500" 
            : completionPercentage > 50 
              ? "bg-amber-500" 
              : "bg-primary"
        }
      />
      
      <div className="flex justify-between text-xs text-muted-foreground mt-1">
        <span>Introduction</span>
        <span>Complete</span>
      </div>
    </div>
  );
};

export default LessonHorizontalNavigator;
