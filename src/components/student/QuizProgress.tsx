
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import GardenProgress from '@/components/ui/garden-progress';

interface QuizProgressProps {
  currentQuestion: number;
  totalQuestions: number;
  className?: string;
}

const QuizProgress: React.FC<QuizProgressProps> = ({ 
  currentQuestion, 
  totalQuestions,
  className
}) => {
  // Calculate percentage complete
  const percentComplete = totalQuestions > 0 
    ? Math.round((currentQuestion / totalQuestions) * 100)
    : 0;
  
  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <GardenProgress 
            value={percentComplete} 
            showParticles={percentComplete % 25 === 0}
          />
          <div>
            <p className="text-sm font-medium">Question {currentQuestion} of {totalQuestions}</p>
            <p className="text-xs text-muted-foreground">
              {percentComplete}% complete
            </p>
          </div>
        </div>
      </div>
      <Progress 
        value={percentComplete} 
        className="h-1.5" 
        indicatorClassName={
          percentComplete === 100 
            ? "bg-gradient-to-r from-primary to-green-500" 
            : "bg-gradient-to-r from-primary/70 to-primary"
        } 
      />
    </div>
  );
};

export default QuizProgress;
