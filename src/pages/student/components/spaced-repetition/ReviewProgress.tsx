
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Star } from 'lucide-react';

interface ReviewProgressProps {
  currentItemIndex: number;
  totalItems: number;
  points: number | null;
}

const ReviewProgress: React.FC<ReviewProgressProps> = ({
  currentItemIndex,
  totalItems,
  points
}) => {
  return (
    <>
      <div className="mb-4 flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          Question {currentItemIndex + 1} of {totalItems}
        </div>
        {points !== null && (
          <div className="flex items-center gap-1 bg-amber-100 text-amber-700 px-2 py-1 rounded-full text-sm font-medium">
            <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
            <span>+{points} points</span>
          </div>
        )}
      </div>
      
      <Progress 
        value={(currentItemIndex / totalItems) * 100} 
        className="h-2 mb-6" 
      />
    </>
  );
};

export default ReviewProgress;
