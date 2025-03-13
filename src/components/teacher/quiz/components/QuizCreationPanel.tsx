
import React from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';

interface QuizCreationPanelProps {
  title: string;
  onCreateQuiz: () => void;
  disabled: boolean;
  loading?: boolean;
}

const QuizCreationPanel: React.FC<QuizCreationPanelProps> = ({
  title,
  onCreateQuiz,
  disabled,
  loading = false
}) => {
  return (
    <div className="text-center py-12 border rounded-md bg-muted">
      <p className="mb-4">Create a quiz for this lesson</p>
      <Button 
        onClick={onCreateQuiz} 
        disabled={disabled || loading}
        className="gap-2"
      >
        <Sparkles className="h-4 w-4" />
        {loading ? 'Creating...' : 'Create Quiz'}
      </Button>
    </div>
  );
};

export default QuizCreationPanel;
