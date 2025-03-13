
import React from 'react';
import { CardContent } from '@/components/ui/card';
import { Check, X, Edit2, Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface QuizPreviewContentProps {
  questions: any[];
  isLoading: boolean;
  isEditMode: boolean;
  onUpdateQuestion: (questionId: string, updates: any) => Promise<void>;
  onDeleteQuestion: (questionId: string) => Promise<void>;
}

const QuizPreviewContent: React.FC<QuizPreviewContentProps> = ({
  questions,
  isLoading,
  isEditMode,
  onUpdateQuestion,
  onDeleteQuestion
}) => {
  if (isLoading) {
    return (
      <CardContent>
        <div className="text-center p-6">
          Loading questions...
        </div>
      </CardContent>
    );
  }

  if (questions.length === 0) {
    return (
      <CardContent>
        <div className="text-center p-6">
          <p className="text-muted-foreground">No questions added yet.</p>
          {isEditMode && (
            <p className="text-sm mt-2">
              Click "Add Question" to start creating your quiz.
            </p>
          )}
        </div>
      </CardContent>
    );
  }

  return (
    <CardContent>
      <div className="space-y-6">
        {questions.map((question, index) => (
          <div 
            key={question.id} 
            className="border rounded-lg p-4 relative"
          >
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <div className="flex items-center">
                  <span className="text-sm font-medium bg-muted px-2 py-0.5 rounded mr-2">
                    Q{index + 1}
                  </span>
                  <h4 className="font-medium">{question.question_text}</h4>
                </div>
                
                <ul className="space-y-2 mt-3">
                  {question.options && question.options.map((option: any, optionIndex: number) => (
                    <li 
                      key={option.id || optionIndex} 
                      className={`flex items-center p-2 rounded ${
                        option.is_correct ? 'bg-green-50 border border-green-200' : ''
                      }`}
                    >
                      {option.is_correct ? (
                        <Check className="h-4 w-4 text-green-500 mr-2 shrink-0" />
                      ) : (
                        <span className="w-4 h-4 mr-2" />
                      )}
                      <span>{option.option_text}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              {isEditMode && (
                <div className="flex space-x-1">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => onUpdateQuestion(question.id, { question_text: question.question_text })}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => onDeleteQuestion(question.id)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </CardContent>
  );
};

export default QuizPreviewContent;
