
import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface QuizPlaceholderProps {
  onStartGeneration: (numQuestionsStr: string) => Promise<void>;
  onManualCreate: () => Promise<void>;
}

const QuizPlaceholder: React.FC<QuizPlaceholderProps> = ({ 
  onStartGeneration,
  onManualCreate
}) => {
  const [numQuestions, setNumQuestions] = React.useState('5');

  const handleGenerate = () => {
    onStartGeneration(numQuestions);
  };

  return (
    <div className="p-8 text-center border rounded-md bg-muted">
      <div className="flex flex-col items-center gap-4 max-w-md mx-auto">
        <AlertCircle className="h-12 w-12 text-muted-foreground" />
        <h3 className="text-xl font-medium">Create a Quiz</h3>
        <p className="text-muted-foreground mb-4">You can generate a quiz automatically or create one manually</p>
        
        <div className="w-full space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Number of Questions</label>
            <input 
              type="number" 
              className="w-full p-2 border rounded"
              value={numQuestions}
              onChange={(e) => setNumQuestions(e.target.value)}
              min="1"
              max="10"
            />
          </div>
          
          <div className="flex flex-col gap-2">
            <Button 
              onClick={handleGenerate}
              className="w-full"
            >
              Generate Quiz Automatically
            </Button>
            
            <Button 
              variant="outline"
              onClick={onManualCreate}
              className="w-full"
            >
              Create Quiz Manually
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizPlaceholder;
