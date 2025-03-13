
import React from 'react';
import { Loader2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface QuizActionsProps {
  onSave: () => void;
  onDiscard: () => void;
  saving: boolean;
  existingQuiz: boolean;
}

const QuizActions: React.FC<QuizActionsProps> = ({ 
  onSave, 
  onDiscard, 
  saving, 
  existingQuiz 
}) => {
  return (
    <div className="flex justify-end gap-2 pt-4">
      <Button 
        variant="outline" 
        onClick={onDiscard}
        disabled={saving}
      >
        {existingQuiz ? 'Delete Quiz' : 'Discard'}
      </Button>
      <Button 
        onClick={onSave}
        disabled={saving}
        className="gap-2"
      >
        {saving ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Saving...
          </>
        ) : (
          <>
            <Save className="h-4 w-4" />
            {existingQuiz ? 'Update Quiz' : 'Save Quiz'} 
          </>
        )}
      </Button>
    </div>
  );
};

export default QuizActions;
