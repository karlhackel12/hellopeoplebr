
import React from 'react';
import { Loader2, RotateCcw, RefreshCw } from 'lucide-react';
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
import { AlertCircle } from 'lucide-react';

interface QuizGenerationFormProps {
  numQuestions: string;
  setNumQuestions: (value: string) => void;
  onGenerateQuiz: () => void;
  loading: boolean;
  isRetrying?: boolean;
  error?: string | null;
  existingQuiz: boolean;
}

const QuizGenerationForm: React.FC<QuizGenerationFormProps> = ({
  numQuestions,
  setNumQuestions,
  onGenerateQuiz,
  loading,
  isRetrying = false,
  error,
  existingQuiz
}) => {
  return (
    <Card className="p-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">AI Quiz Generator</h3>
        <p className="text-sm text-muted-foreground">
          Create a quiz automatically by analyzing your lesson content using AI
        </p>
        
        {error && (
          <div className="p-3 border rounded-md bg-red-50 text-red-800 flex items-center gap-2 text-sm">
            <AlertCircle className="h-4 w-4" />
            <span>Error: {error}</span>
          </div>
        )}
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Label htmlFor="num-questions">Number of Questions:</Label>
            <Select
              value={numQuestions}
              onValueChange={setNumQuestions}
              disabled={loading}
            >
              <SelectTrigger id="num-questions" className="w-24">
                <SelectValue placeholder="5" />
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
            type="button"
          >
            {loading ? (
              <>
                {isRetrying ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
                {isRetrying ? 'Retrying...' : 'Generating...'}
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
