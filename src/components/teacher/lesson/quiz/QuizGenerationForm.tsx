import React from 'react';
import { RefreshCw, RotateCcw, Sparkles, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';
import QuizGenerationProgress from './components/QuizGenerationProgress';
import { GenerationPhase } from '../../quiz/types/quizGeneration';
interface QuizGenerationFormProps {
  numQuestions: string;
  setNumQuestions: (value: string) => void;
  onGenerateQuiz: () => void;
  loading: boolean;
  isRetrying?: boolean;
  error?: string | null;
  errorDetails?: string | null;
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
  errorDetails,
  existingQuiz,
  currentPhase
}) => {
  const showProgress = currentPhase !== 'idle' && currentPhase !== 'error';
  return <Card>
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
        {error && <div className="p-3 border rounded-md bg-red-50 text-red-800 flex flex-col gap-2 text-sm">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
            
            {errorDetails && <div className="text-xs text-red-700 pl-6 mt-1 bg-red-100/50 p-2 rounded">
                <details>
                  <summary className="cursor-pointer">Technical details</summary>
                  <div className="mt-1 whitespace-pre-wrap">{errorDetails}</div>
                </details>
              </div>}
          </div>}
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          
          
          <Button onClick={onGenerateQuiz} variant="default" disabled={loading} className="gap-2" type="button">
            {loading ? <>
                {isRetrying ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4 animate-pulse" />}
                {isRetrying ? 'Retrying...' : 'Generating...'}
              </> : existingQuiz ? <>
                <RotateCcw className="h-4 w-4" />
                Regenerate Quiz
              </> : <>
                <Sparkles className="h-4 w-4" />
                Generate Quiz
              </>}
          </Button>
        </div>
        
        {showProgress && <QuizGenerationProgress currentPhase={currentPhase} isRetrying={isRetrying} errorMessage={error} />}
        
        {currentPhase === 'error' && <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded text-sm text-amber-800">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <p>You can try again with fewer questions or a simpler lesson content.</p>
          </div>}
        
        <div className="border-t pt-4 text-sm text-muted-foreground">
          <p>
            Our smart AI looks at your lesson content and creates targeted questions to help
            students test their understanding. The better your lesson content, the better the
            questions will be.
          </p>
        </div>
      </CardContent>
    </Card>;
};
export default QuizGenerationForm;