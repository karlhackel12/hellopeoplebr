
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Brain, FileText, CheckCircle2, Loader2 } from 'lucide-react';

export type GenerationPhase = 'idle' | 'content-loading' | 'analyzing' | 'generating' | 'saving' | 'complete' | 'error';

interface PhaseInfo {
  icon: React.ReactNode;
  label: string;
  description: string;
}

interface QuizGenerationProgressProps {
  currentPhase: GenerationPhase;
  isRetrying?: boolean;
}

const QuizGenerationProgress: React.FC<QuizGenerationProgressProps> = ({
  currentPhase,
  isRetrying = false
}) => {
  const phases: Record<GenerationPhase, PhaseInfo> = {
    'idle': {
      icon: <div className="w-5 h-5" />,
      label: 'Waiting to start',
      description: 'Quiz generation has not started yet'
    },
    'content-loading': {
      icon: <FileText className="h-5 w-5 text-blue-500" />,
      label: 'Loading lesson content',
      description: 'Retrieving your lesson content for analysis'
    },
    'analyzing': {
      icon: <Brain className="h-5 w-5 text-purple-500" />,
      label: 'Analyzing content',
      description: 'Identifying key concepts and learning objectives'
    },
    'generating': {
      icon: isRetrying 
        ? <Loader2 className="h-5 w-5 text-amber-500 animate-spin" />
        : <Loader2 className="h-5 w-5 text-amber-500 animate-spin" />,
      label: isRetrying ? 'Retrying generation' : 'Generating questions',
      description: isRetrying 
        ? 'Refining questions for better quality' 
        : 'Creating quiz questions based on lesson content'
    },
    'saving': {
      icon: <Loader2 className="h-5 w-5 text-green-500 animate-spin" />,
      label: 'Saving quiz',
      description: 'Storing questions in the database'
    },
    'complete': {
      icon: <CheckCircle2 className="h-5 w-5 text-green-600" />,
      label: 'Complete',
      description: 'Quiz has been successfully generated'
    },
    'error': {
      icon: <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center text-white font-bold">!</div>,
      label: 'Error',
      description: 'There was a problem generating the quiz'
    }
  };

  // Calculate progress percentage based on current phase
  const getProgressPercentage = () => {
    const phaseValues: GenerationPhase[] = ['idle', 'content-loading', 'analyzing', 'generating', 'saving', 'complete'];
    const currentIndex = phaseValues.indexOf(currentPhase);
    
    if (currentPhase === 'error') return 100;
    if (currentIndex === -1) return 0;
    
    return Math.round((currentIndex / (phaseValues.length - 1)) * 100);
  };

  const progressPercentage = getProgressPercentage();
  const currentInfo = phases[currentPhase];

  return (
    <div className="space-y-4 p-4 bg-muted/30 rounded-md border">
      <div className="flex items-center gap-3">
        <div className="shrink-0">
          {currentInfo.icon}
        </div>
        <div>
          <h4 className="font-medium">{currentInfo.label}</h4>
          <p className="text-sm text-muted-foreground">{currentInfo.description}</p>
        </div>
      </div>
      
      <Progress 
        value={progressPercentage} 
        className="h-2" 
        indicatorClassName={currentPhase === 'error' ? 'bg-red-500' : undefined}
      />
      
      <div className="grid grid-cols-5 gap-1 text-xs">
        {['content-loading', 'analyzing', 'generating', 'saving', 'complete'].map((phase) => {
          const phaseInfo = phases[phase as GenerationPhase];
          const isActive = phase === currentPhase;
          const isPast = getProgressPercentage() > phaseValues.indexOf(phase as GenerationPhase) * 25;
          
          return (
            <div 
              key={phase}
              className={`text-center ${isActive ? 'text-primary font-medium' : isPast ? 'text-muted-foreground' : 'text-muted'}`}
            >
              {phaseInfo.label.split(' ')[0]}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default QuizGenerationProgress;
