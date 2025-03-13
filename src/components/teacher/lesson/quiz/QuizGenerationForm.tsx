
import React, { useState } from 'react';
import { RefreshCw, RotateCcw, Sparkles, AlertCircle, InfoIcon, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';
import QuizGenerationProgress, { GenerationPhase } from './components/QuizGenerationProgress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Checkbox } from '@/components/ui/checkbox';

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
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [optimizeContent, setOptimizeContent] = useState(true);
  const [questionDifficulty, setQuestionDifficulty] = useState<string>("balanced");
  
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
          <div className="p-3 border rounded-md bg-red-50 text-red-800 flex flex-col gap-2 text-sm">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
            
            {errorDetails && (
              <div className="text-xs text-red-700 pl-6 mt-1 bg-red-100/50 p-2 rounded">
                <details>
                  <summary className="cursor-pointer">Technical details</summary>
                  <div className="mt-1 whitespace-pre-wrap">{errorDetails}</div>
                </details>
              </div>
            )}
          </div>
        )}
        
        <div className="grid gap-4">
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
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="text-muted-foreground cursor-help">
                      <InfoIcon className="h-4 w-4" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">The number of multiple-choice questions to generate. Choose fewer questions for shorter lessons.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            
            <div className="flex items-center gap-2">
              <Popover open={showAdvancedOptions} onOpenChange={setShowAdvancedOptions}>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-1">
                    <Settings className="h-3.5 w-3.5" />
                    Options
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                  <div className="space-y-3">
                    <h4 className="font-medium">Advanced Options</h4>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="optimize" 
                        checked={optimizeContent} 
                        onCheckedChange={(checked) => setOptimizeContent(!!checked)}
                      />
                      <Label htmlFor="optimize" className="text-sm">Optimize long content for better questions</Label>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="difficulty" className="text-sm">Question Difficulty</Label>
                      <Select
                        value={questionDifficulty}
                        onValueChange={setQuestionDifficulty}
                      >
                        <SelectTrigger id="difficulty">
                          <SelectValue placeholder="Balanced" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="easy">Easier Questions</SelectItem>
                          <SelectItem value="balanced">Balanced</SelectItem>
                          <SelectItem value="challenging">More Challenging</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            
            <Button 
              onClick={onGenerateQuiz} 
              variant="default"
              disabled={loading}
              className="gap-2 ml-auto"
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
        </div>
        
        {showProgress && (
          <QuizGenerationProgress 
            currentPhase={currentPhase}
            isRetrying={isRetrying}
            errorMessage={error}
          />
        )}
        
        {currentPhase === 'error' && (
          <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded text-sm text-amber-800">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <p>You can try again with fewer questions or a simpler lesson content.</p>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="border-t pt-4 text-sm text-muted-foreground flex flex-col items-start">
        <p>
          Our smart AI looks at your lesson content and creates targeted questions to help
          students test their understanding. The better your lesson content, the better the
          questions will be.
        </p>
      </CardFooter>
    </Card>
  );
};

export default QuizGenerationForm;
