
import React from 'react';
import { Progress } from '@/components/ui/progress';

interface QuizProgressProps {
  currentIndex: number;
  totalQuestions: number;
}

const QuizProgress: React.FC<QuizProgressProps> = ({ 
  currentIndex, 
  totalQuestions 
}) => {
  const progressPercentage = totalQuestions > 0 
    ? Math.round((currentIndex + 1) / totalQuestions * 100) 
    : 0;
    
  return (
    <div className="mb-6">
      <div className="flex justify-between text-sm text-muted-foreground mb-2">
        <span>Progress</span>
        <span>{progressPercentage}%</span>
      </div>
      <Progress value={progressPercentage} className="h-2" />
    </div>
  );
};

export default QuizProgress;
