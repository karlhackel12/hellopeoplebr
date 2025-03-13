
import React from 'react';
import { Button } from '@/components/ui/button';

interface QuizCreationPanelProps {
  title: string;
  onCreateQuiz: () => void;
  disabled: boolean;
}

const QuizCreationPanel: React.FC<QuizCreationPanelProps> = ({
  title,
  onCreateQuiz,
  disabled
}) => {
  return (
    <div className="text-center py-12 border rounded-md bg-muted">
      <p className="mb-4">Create a quiz for this lesson</p>
      <Button onClick={onCreateQuiz} disabled={disabled}>
        Create Quiz
      </Button>
    </div>
  );
};

export default QuizCreationPanel;
