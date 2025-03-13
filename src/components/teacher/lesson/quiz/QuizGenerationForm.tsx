
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Sparkles } from 'lucide-react';
import QuizGenerationProgress, { GenerationPhase } from './components/QuizGenerationProgress';
import QuestionSelector from './components/QuestionSelector';
import AdvancedOptionsPopover from './components/AdvancedOptionsPopover';
import GenerateQuizButton from './components/GenerateQuizButton';
import FormErrorDisplay from './components/FormErrorDisplay';
import GenerationWarning from './components/GenerationWarning';

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
        <FormErrorDisplay error={error} errorDetails={errorDetails} />
        
        <div className="grid gap-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <QuestionSelector 
              numQuestions={numQuestions}
              setNumQuestions={setNumQuestions}
              disabled={loading}
            />
            
            <AdvancedOptionsPopover
              optimizeContent={optimizeContent}
              setOptimizeContent={setOptimizeContent}
              questionDifficulty={questionDifficulty}
              setQuestionDifficulty={setQuestionDifficulty}
              showAdvancedOptions={showAdvancedOptions}
              setShowAdvancedOptions={setShowAdvancedOptions}
              disabled={loading}
            />
            
            <GenerateQuizButton
              onClick={onGenerateQuiz}
              loading={loading}
              isRetrying={isRetrying}
              existingQuiz={existingQuiz}
              disabled={loading}
            />
          </div>
        </div>
        
        {showProgress && (
          <QuizGenerationProgress 
            currentPhase={currentPhase}
            isRetrying={isRetrying}
            errorMessage={error}
          />
        )}
        
        {currentPhase === 'error' && <GenerationWarning />}
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
