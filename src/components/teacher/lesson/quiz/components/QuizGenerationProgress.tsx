
import React from 'react';
import { AlertCircle, CheckCircle, Clock, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export type GenerationPhase = 
  | 'idle' 
  | 'content-loading' 
  | 'analyzing' 
  | 'generating' 
  | 'saving' 
  | 'complete' 
  | 'error';

interface QuizGenerationProgressProps {
  currentPhase: GenerationPhase;
  loadingMessage?: string | null;
  error?: string | null;
  isRetrying?: boolean;
}

const QuizGenerationProgress: React.FC<QuizGenerationProgressProps> = ({
  currentPhase,
  loadingMessage,
  error,
  isRetrying = false
}) => {
  const getPhaseStatus = (phase: string) => {
    if (currentPhase === 'error') {
      return phase === 'error' ? 'current' : 'incomplete';
    }
    
    const phases: GenerationPhase[] = ['content-loading', 'analyzing', 'generating', 'saving', 'complete'];
    const currentIndex = phases.indexOf(currentPhase);
    const phaseIndex = phases.indexOf(phase as GenerationPhase);
    
    if (currentIndex === -1 || phaseIndex === -1) {
      return 'incomplete';
    }
    
    if (phaseIndex < currentIndex) {
      return 'complete';
    } else if (phaseIndex === currentIndex) {
      return 'current';
    } else {
      return 'incomplete';
    }
  };

  const renderPhaseIcon = (phase: string, status: string) => {
    if (status === 'complete') {
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    } else if (status === 'current') {
      if (phase === 'error') {
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      }
      return <Loader2 className="h-5 w-5 animate-spin text-primary" />;
    } else {
      return <Clock className="h-5 w-5 text-muted-foreground/50" />;
    }
  };

  if (currentPhase === 'idle') {
    return null;
  }

  return (
    <div className="space-y-4 my-4">
      <div className="flex items-center justify-center space-x-2">
        {isRetrying && (
          <span className="text-sm text-amber-600 font-medium">
            Retrying generation with improved parameters...
          </span>
        )}
      </div>
      
      <div className="grid grid-cols-5 gap-2">
        {['content-loading', 'analyzing', 'generating', 'saving', 'complete'].map((phase) => {
          const status = getPhaseStatus(phase);
          return (
            <div 
              key={phase}
              className={cn(
                "flex flex-col items-center p-2 rounded-md transition-colors",
                status === 'current' && phase !== 'error' && "bg-primary/10",
                status === 'complete' && "bg-green-50/50 dark:bg-green-950/20"
              )}
            >
              {renderPhaseIcon(phase, status)}
              <span className={cn(
                "text-xs mt-1 text-center capitalize",
                status === 'current' && phase !== 'error' && "text-primary font-medium",
                status === 'complete' && "text-green-600 dark:text-green-400",
                status === 'incomplete' && "text-muted-foreground/50"
              )}>
                {phase.replace(/-/g, ' ')}
              </span>
            </div>
          );
        })}
      </div>
      
      {loadingMessage && currentPhase !== 'complete' && (
        <div className="text-center text-sm text-muted-foreground animate-pulse">
          {loadingMessage}
        </div>
      )}
      
      {currentPhase === 'complete' && (
        <div className="text-center text-sm text-green-600 dark:text-green-400">
          Quiz generation complete!
        </div>
      )}
      
      {currentPhase === 'error' && error && (
        <div className="text-center text-sm text-red-500">
          {error}
        </div>
      )}
    </div>
  );
};

export default QuizGenerationProgress;
