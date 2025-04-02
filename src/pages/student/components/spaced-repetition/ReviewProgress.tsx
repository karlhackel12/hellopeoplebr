
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Trophy } from 'lucide-react';

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
  const progressValue = Math.min(100, (currentItemIndex / totalItems) * 100);
  
  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium">
          {currentItemIndex}/{totalItems} itens revisados
        </span>
        {points !== null && (
          <span className="text-sm font-medium flex items-center">
            <Trophy className="h-4 w-4 text-[#9b87f5] mr-1" /> 
            {points} pontos
          </span>
        )}
      </div>
      <Progress value={progressValue} className="h-2 bg-gray-200" indicatorClassName="bg-[#9b87f5]" />
    </div>
  );
};

export default ReviewProgress;
