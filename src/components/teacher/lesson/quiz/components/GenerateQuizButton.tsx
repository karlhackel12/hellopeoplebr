
import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, RotateCcw, Sparkles } from 'lucide-react';

interface GenerateQuizButtonProps {
  onClick: () => void;
  loading: boolean;
  isRetrying?: boolean;
  existingQuiz: boolean;
  disabled?: boolean;
}

const GenerateQuizButton: React.FC<GenerateQuizButtonProps> = ({
  onClick,
  loading,
  isRetrying = false,
  existingQuiz,
  disabled = false
}) => {
  return (
    <Button 
      onClick={onClick} 
      variant="default"
      disabled={disabled || loading}
      className="gap-2 ml-auto"
      type="button"
    >
      {loading ? (
        <>
          {isRetrying ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4 animate-pulse" />
          )}
          {isRetrying ? 'Retrying...' : 'Generating...'}
        </>
      ) : existingQuiz ? (
        <>
          <RotateCcw className="h-4 w-4" />
          Regenerate Quiz
        </>
      ) : (
        <>
          <Sparkles className="h-4 w-4" />
          Generate Quiz
        </>
      )}
    </Button>
  );
};

export default GenerateQuizButton;
