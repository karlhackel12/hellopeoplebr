
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface QuizTabProps {
  quizId?: string;
  isEditMode?: boolean;
}

const QuizTab: React.FC<QuizTabProps> = ({ quizId, isEditMode = false }) => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleCreateQuiz = () => {
    navigate('/teacher/quizzes/create');
  };

  const handleEditQuiz = () => {
    if (quizId) {
      navigate(`/teacher/quizzes/${quizId}/edit`);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!quizId && !isEditMode) {
    return (
      <Card className="p-8 text-center">
        <h3 className="text-xl font-medium mb-4">No Quiz Available</h3>
        <p className="text-muted-foreground mb-6">
          There is currently no quiz associated with this content.
        </p>
        <Button onClick={handleCreateQuiz}>
          Create a New Quiz
        </Button>
      </Card>
    );
  }

  if (quizId && !isEditMode) {
    return (
      <Card className="p-8 text-center">
        <h3 className="text-xl font-medium mb-4">Quiz Available</h3>
        <p className="text-muted-foreground mb-6">
          This content has an associated quiz that students can take.
        </p>
        <Button onClick={handleEditQuiz}>
          View/Edit Quiz
        </Button>
      </Card>
    );
  }

  // This is for when we're in edit mode but creating a new quiz (no quizId)
  return (
    <div className="bg-muted p-8 rounded-lg text-center">
      <h3 className="text-xl font-medium mb-2">Create Quiz</h3>
      <p className="text-muted-foreground mb-4">
        You can create a new quiz by clicking the button below.
      </p>
      <Button onClick={handleCreateQuiz}>
        Create Quiz
      </Button>
    </div>
  );
};

export default QuizTab;
