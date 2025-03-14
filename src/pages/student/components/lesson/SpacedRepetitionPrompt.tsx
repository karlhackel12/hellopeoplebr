
import React from 'react';
import { Brain, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useSpacedRepetition } from '../../hooks/useSpacedRepetition';
import { toast } from 'sonner';

interface SpacedRepetitionPromptProps {
  quizId: string;
  lessonId?: string;
  visible: boolean;
  onClose: () => void;
}

const SpacedRepetitionPrompt: React.FC<SpacedRepetitionPromptProps> = ({
  quizId,
  lessonId,
  visible,
  onClose
}) => {
  const { addQuestionsFromQuiz } = useSpacedRepetition();
  const [adding, setAdding] = React.useState(false);
  
  if (!visible) return null;
  
  const handleAddToReview = async () => {
    try {
      setAdding(true);
      await addQuestionsFromQuiz({ quizId, lessonId });
      onClose();
    } catch (error) {
      console.error('Failed to add questions to review:', error);
      toast.error('Failed to add questions to spaced repetition system');
    } finally {
      setAdding(false);
    }
  };
  
  return (
    <Card className="border-blue-100 bg-blue-50 mt-6 overflow-hidden transition-all duration-300">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="bg-blue-100 p-2 rounded-full">
            <Brain className="h-5 w-5 text-blue-600" />
          </div>
          
          <div className="flex-1">
            <h4 className="font-medium text-blue-800 mb-1">Boost Your Long-Term Memory</h4>
            <p className="text-sm text-blue-700 mb-3">
              Add these quiz questions to your spaced repetition system to improve
              retention and make sure you remember this material for years to come.
            </p>
            
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="default"
                className="bg-blue-600 hover:bg-blue-700"
                onClick={handleAddToReview}
                disabled={adding}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add to Spaced Repetition
              </Button>
              
              <Button
                size="sm"
                variant="ghost"
                className="text-blue-700"
                onClick={onClose}
                disabled={adding}
              >
                Dismiss
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SpacedRepetitionPrompt;
