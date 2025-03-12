
import React from 'react';
import { RefreshCw, RotateCcw, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';
import QuizGenerationProgress, { GenerationPhase } from './components/QuizGenerationProgress';

interface QuizGenerationFormProps {
  numQuestions: string;
  setNumQuestions: (value: string) => void;
  onGenerateQuiz: () => void;
  loading: boolean;
  isRetrying?: boolean;
  error?: string | null;
  existingQuiz: boolean;
  currentPhase: GenerationPhase;
}

const QuizGenerationForm: React.FC<QuizGenerationFormProps> = ({
  numQuestions,
  setNumQuestions,
  onGenerateQuiz,
  loading,
  isRetrying = false,
  error,
  existingQuiz,
  currentPhase
}) => {
  const showProgress = currentPhase !== 'idle' && currentPhase !== 'error';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          AI Quiz Generator
        </CardTitle>
        <CardDescription>
          Automatically create quiz questions by analyzing your lesson content with AI
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {error && (
          <div className="p-3 border rounded-md bg-red-50 text-red-800 flex items-center gap-2 text-sm">
            <AlertCircle className="h-4 w-4" />
            <span>Error: {error}</span>
          </div>
        )}
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
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
            variant="default"
            disabled={loading}
            className="gap-2"
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
        </div>
        
        {showProgress && (
          <QuizGenerationProgress 
            currentPhase={currentPhase}
            isRetrying={isRetrying}
          />
        )}
        
        <div className="border-t pt-4 text-sm text-muted-foreground">
          <p>
            Our smart AI looks at your lesson content and creates targeted questions to help
            students test their understanding. The better your lesson content, the better the
            questions will be.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuizGenerationForm;
