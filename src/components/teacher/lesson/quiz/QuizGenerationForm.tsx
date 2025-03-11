
import React from 'react';
import { Loader2, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';

interface QuizGenerationFormProps {
  numQuestions: string;
  setNumQuestions: (value: string) => void;
  onGenerateQuiz: () => void;
  loading: boolean;
  existingQuiz: boolean;
}

const QuizGenerationForm: React.FC<QuizGenerationFormProps> = ({
  numQuestions,
  setNumQuestions,
  onGenerateQuiz,
  loading,
  existingQuiz
}) => {
  return (
    <Card className="p-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">AI Quiz Generator</h3>
        <p className="text-sm text-muted-foreground">
          Create a quiz automatically by analyzing your lesson content using AI
        </p>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Label htmlFor="num-questions">Number of Questions:</Label>
            <Select
              value={numQuestions}
              onValueChange={setNumQuestions}
            >
              <SelectTrigger id="num-questions" className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3">3</SelectItem>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="7">7</SelectItem>
                <SelectItem value="10">10</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button 
            onClick={onGenerateQuiz} 
            variant="secondary"
            disabled={loading}
            className="gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : existingQuiz ? (
              <>
                <RotateCcw className="h-4 w-4" />
                Regenerate Quiz
              </>
            ) : (
              'Generate Quiz'
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default QuizGenerationForm;
