
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { Brain, BookText, CheckCircle, Loader2 } from 'lucide-react';

export type GenerationPhase = 'idle' | 'loading-lesson' | 'analyzing' | 'generating' | 'validating' | 'complete' | 'error';

interface QuizGenerationProgressProps {
  currentPhase: GenerationPhase;
}

interface PhaseInfo {
  label: string;
  icon: React.ReactNode;
  progress: number;
}

const QuizGenerationProgress: React.FC<QuizGenerationProgressProps> = ({ currentPhase }) => {
  const phases: Record<GenerationPhase, PhaseInfo> = {
    'idle': { 
      label: 'Ready to generate', 
      icon: <CheckCircle className="h-5 w-5 text-muted-foreground" />, 
      progress: 0 
    },
    'loading-lesson': { 
      label: 'Loading lesson content', 
      icon: <BookText className="h-5 w-5 text-blue-500 animate-pulse" />, 
      progress: 20 
    },
    'analyzing': { 
      label: 'Analyzing lesson content', 
      icon: <Brain className="h-5 w-5 text-blue-500 animate-pulse" />, 
      progress: 40 
    },
    'generating': { 
      label: 'Generating quiz questions', 
      icon: <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />, 
      progress: 60 
    },
    'validating': { 
      label: 'Validating questions', 
      icon: <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />, 
      progress: 80 
    },
    'complete': { 
      label: 'Quiz generation complete!', 
      icon: <CheckCircle className="h-5 w-5 text-green-500" />, 
      progress: 100
    },
    'error': { 
      label: 'Error generating quiz', 
      icon: <CheckCircle className="h-5 w-5 text-red-500" />, 
      progress: 0 
    }
  };

  const currentPhaseInfo = phases[currentPhase];

  if (currentPhase === 'idle' || currentPhase === 'error') {
    return null;
  }

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-center gap-3 mb-2">
          {currentPhaseInfo.icon}
          <span className="font-medium">{currentPhaseInfo.label}</span>
        </div>
        <Progress value={currentPhaseInfo.progress} className="h-2" />
      </CardContent>
    </Card>
  );
};

export default QuizGenerationProgress;
