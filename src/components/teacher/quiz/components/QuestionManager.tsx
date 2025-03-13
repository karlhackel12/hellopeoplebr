
import React from 'react';
import { Question } from '../types';
import { Button } from '@/components/ui/button';
import { PlusCircle, Sparkles } from 'lucide-react';
import QuestionForm from '../QuestionForm';
import QuestionList from '../QuestionList';
import { GenerationPhase } from '../../lesson/quiz/components/QuizGenerationProgress';
import QuizGenerationProgress from '../../lesson/quiz/components/QuizGenerationProgress';

interface QuestionManagerProps {
  questions: Question[];
  currentQuestion: Question | null;
  addingQuestion: boolean;
  savingQuestion: boolean;
  onAddQuestion: () => void;
  onEditQuestion: (question: Question) => void;
  onDeleteQuestion: (questionId: string) => void;
  onQuestionChange: (field: string, value: any) => void;
  onOptionChange: (index: number, field: string, value: any) => void;
  onAddOption: () => void;
  onRemoveOption: (index: number) => void;
  onCancelEdit: () => void;
  onSaveQuestion: () => void;
  onGenerateQuestions?: () => Promise<void>;
  generationPhase?: GenerationPhase;
  isRetrying?: boolean;
  showGenerateButton?: boolean;
}

const QuestionManager: React.FC<QuestionManagerProps> = ({
  questions,
  currentQuestion,
  addingQuestion,
  savingQuestion,
  onAddQuestion,
  onEditQuestion,
  onDeleteQuestion,
  onQuestionChange,
  onOptionChange,
  onAddOption,
  onRemoveOption,
  onCancelEdit,
  onSaveQuestion,
  onGenerateQuestions,
  generationPhase = 'idle',
  isRetrying = false,
  showGenerateButton = false,
}) => {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Questions</h2>
        <div className="flex gap-2">
          {showGenerateButton && onGenerateQuestions && (
            <Button 
              onClick={onGenerateQuestions} 
              variant="outline" 
              className="gap-2"
              disabled={generationPhase !== 'idle' && generationPhase !== 'complete' && generationPhase !== 'error'}
            >
              <Sparkles className="h-4 w-4" />
              Regenerate Questions
            </Button>
          )}
          
          {!addingQuestion && (
            <Button onClick={onAddQuestion} className="gap-2">
              <PlusCircle className="h-4 w-4" />
              Add Question
            </Button>
          )}
        </div>
      </div>

      {generationPhase !== 'idle' && generationPhase !== 'complete' && (
        <div className="mb-6 p-4 bg-muted rounded-md">
          <QuizGenerationProgress 
            currentPhase={generationPhase}
            isRetrying={isRetrying}
          />
        </div>
      )}

      {addingQuestion ? (
        <QuestionForm
          currentQuestion={currentQuestion}
          saving={savingQuestion}
          onQuestionChange={onQuestionChange}
          onOptionChange={onOptionChange}
          onAddOption={onAddOption}
          onRemoveOption={onRemoveOption}
          onCancel={onCancelEdit}
          onSave={onSaveQuestion}
        />
      ) : null}

      <QuestionList
        questions={questions}
        onEditQuestion={onEditQuestion}
        onDeleteQuestion={onDeleteQuestion}
      />
    </div>
  );
};

export default QuestionManager;
