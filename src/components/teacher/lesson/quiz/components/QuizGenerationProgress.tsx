
import React from 'react';
import { Sparkles, RefreshCw, CheckCircle2 } from 'lucide-react';

export type GenerationPhase = 'idle' | 'analyzing' | 'generating' | 'complete' | 'error' | 'content-loading' | 'saving';

interface QuizGenerationProgressProps {
  currentPhase: GenerationPhase;
  isRetrying?: boolean;
  errorMessage?: string | null;
}

const QuizGenerationProgress: React.FC<QuizGenerationProgressProps> = ({
  currentPhase,
  isRetrying = false,
  errorMessage = null
}) => {
  // Progress steps
  const steps = [
    { id: 'analyzing', label: 'Analyzing Lesson Content', icon: Sparkles },
    { id: 'generating', label: 'Generating Quiz Questions', icon: RefreshCw },
    { id: 'complete', label: 'Quiz Generation Complete', icon: CheckCircle2 }
  ];

  // Get active index
  const getActiveIndex = () => {
    if (currentPhase === 'analyzing' || currentPhase === 'content-loading') return 0;
    if (currentPhase === 'generating') return 1;
    if (currentPhase === 'complete' || currentPhase === 'saving') return 2;
    return -1;
  };

  const activeIndex = getActiveIndex();
  
  if (currentPhase === 'idle') return null;

  return (
    <div className="py-2">
      <ul className="space-y-2">
        {steps.map((step, index) => {
          const isActive = index === activeIndex;
          const isComplete = index < activeIndex || currentPhase === 'complete';
          const Icon = step.icon;
          
          return (
            <li key={step.id} className="flex items-center gap-3">
              <div 
                className={`
                  p-1.5 rounded-full flex items-center justify-center transition-colors
                  ${isActive ? 'bg-primary/10 text-primary' : ''}
                  ${isComplete ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}
                `}
              >
                <Icon 
                  className={`h-4 w-4 ${isActive && isRetrying ? 'animate-spin' : isActive ? 'animate-pulse' : ''}`} 
                />
              </div>
              <span 
                className={`text-sm ${isActive ? 'text-primary font-medium' : isComplete ? 'text-muted-foreground' : 'text-muted-foreground/60'}`}
              >
                {step.label}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default QuizGenerationProgress;
