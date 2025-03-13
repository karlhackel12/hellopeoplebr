
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Loader2 } from 'lucide-react';

interface QuizGenerationProgressProps {
  progress: number;
  numQuestions: number;
}

const QuizGenerationProgress: React.FC<QuizGenerationProgressProps> = ({ 
  progress, 
  numQuestions 
}) => {
  return (
    <div className="p-8 text-center border rounded-md bg-muted">
      <div className="max-w-md mx-auto flex flex-col items-center gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <h3 className="text-xl font-medium">Generating Quiz</h3>
        <p className="text-muted-foreground">
          Creating {numQuestions} quiz questions based on your lesson content
        </p>
        
        <div className="w-full space-y-2">
          <Progress value={progress} />
          <p className="text-sm text-muted-foreground">{Math.round(progress)}% complete</p>
        </div>
      </div>
    </div>
  );
};

export default QuizGenerationProgress;
