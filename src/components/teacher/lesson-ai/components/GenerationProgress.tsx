
import React, { useEffect } from 'react';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import GardenProgress from '@/components/ui/garden-progress';
import { GenerationPhase } from '../hooks/types';

interface GenerationProgressProps {
  phase: GenerationPhase;
  progress: number;
  statusMessage: string;
  error: string | null;
  onCancel?: () => void;
  onRetry?: () => void;
}

const GenerationProgress: React.FC<GenerationProgressProps> = ({
  phase,
  progress,
  statusMessage,
  error,
  onCancel,
  onRetry
}) => {
  // Auto-progress animation
  useEffect(() => {
    if (phase === 'generating' || phase === 'processing') {
      const interval = setInterval(() => {
        // This will provide a small visual progress even when the actual progress is stalled
      }, 1500);
      
      return () => clearInterval(interval);
    }
  }, [phase]);

  // Determine the icon to show based on the phase
  const renderPhaseIcon = () => {
    switch (phase) {
      case 'idle':
        return null;
      case 'error':
        return <AlertCircle className="h-8 w-8 text-destructive animate-pulse" />;
      case 'complete':
        return <CheckCircle className="h-8 w-8 text-primary animate-bounce" />;
      default:
        return <Loader2 className="h-8 w-8 text-primary animate-spin" />;
    }
  };

  if (phase === 'idle') {
    return null;
  }

  return (
    <Card className="w-full mb-4 border-border/40 shadow-sm">
      <CardContent className="p-6">
        <div className="flex flex-col items-center justify-center space-y-4">
          {phase === 'error' ? (
            <Alert variant="destructive" className="mb-4 w-full">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error || 'An error occurred during generation'}</AlertDescription>
            </Alert>
          ) : (
            <>
              <div className="flex items-center justify-center space-x-4">
                <GardenProgress value={progress} />
                <div className="flex flex-col">
                  <h3 className="text-lg font-medium">{getPhaseTitle(phase)}</h3>
                  <p className="text-sm text-muted-foreground">{statusMessage}</p>
                </div>
              </div>

              <Progress 
                value={progress} 
                className="w-full h-2" 
                indicatorClassName={getProgressColor(phase)}
              />
              
              <p className="text-sm text-muted-foreground text-center">
                {phase === 'complete' 
                  ? 'Generation complete! You can now review and edit the content.' 
                  : `${Math.round(progress)}% - ${getEstimatedTimeMessage(phase, progress)}`
                }
              </p>
            </>
          )}

          {/* Action buttons */}
          <div className="flex space-x-4 mt-2">
            {phase !== 'complete' && phase !== 'error' && onCancel && (
              <Button variant="outline" onClick={onCancel} size="sm">
                Cancel Generation
              </Button>
            )}
            
            {phase === 'error' && onRetry && (
              <Button onClick={onRetry} size="sm">
                Retry Generation
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Helper functions
const getPhaseTitle = (phase: GenerationPhase): string => {
  switch (phase) {
    case 'starting':
      return 'Initializing AI';
    case 'analyzing':
      return 'Analyzing Requirements';
    case 'generating':
      return 'Generating Content';
    case 'processing':
      return 'Processing Results';
    case 'complete':
      return 'Generation Complete';
    case 'error':
      return 'Generation Error';
    default:
      return 'Preparing';
  }
};

const getProgressColor = (phase: GenerationPhase): string => {
  switch (phase) {
    case 'complete':
      return 'bg-green-600';
    case 'error':
      return 'bg-red-600';
    default:
      return 'bg-primary';
  }
};

const getEstimatedTimeMessage = (phase: GenerationPhase, progress: number): string => {
  if (progress < 30) {
    return 'This may take up to a minute...';
  } else if (progress < 70) {
    return 'Almost there...';
  } else {
    return 'Finalizing content...';
  }
};

export default GenerationProgress;
