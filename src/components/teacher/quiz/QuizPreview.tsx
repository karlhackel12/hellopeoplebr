
import React from 'react';
import { Question } from './types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface QuizPreviewProps {
  questions: Question[];
  title: string;
  passPercent?: number;
  isPreview?: boolean;
}

const QuizPreview: React.FC<QuizPreviewProps> = ({ 
  questions, 
  title, 
  passPercent = 70, 
  isPreview = false 
}) => {
  const [currentQuestion, setCurrentQuestion] = React.useState(0);

  if (questions.length === 0) {
    return (
      <div className="text-center py-6">
        <AlertCircle className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
        <p className="text-muted-foreground">No quiz questions available</p>
      </div>
    );
  }

  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const question = questions[currentQuestion];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-lg font-medium">{title}</h3>
          <p className="text-sm text-muted-foreground">
            {questions.length} questions • Passing score: {passPercent}%
          </p>
        </div>
        {isPreview && (
          <div className="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded">
            Preview Mode
          </div>
        )}
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle className="text-base">
              Question {currentQuestion + 1} of {questions.length}
            </CardTitle>
            <span className="text-sm text-muted-foreground">
              {question.points} {question.points === 1 ? 'point' : 'points'}
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <p className="mb-4">{question.question_text}</p>
          
          {question.options && (
            <div className="space-y-2">
              {question.options.map((option) => (
                <div 
                  key={option.id} 
                  className={`p-3 rounded-md border ${
                    option.is_correct && isPreview 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{option.option_text}</span>
                    {option.is_correct && isPreview && (
                      <Check className="h-4 w-4 text-green-600" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <div className="flex justify-between mt-6">
            <Button 
              variant="outline" 
              onClick={handlePrevQuestion} 
              disabled={currentQuestion === 0}
            >
              Previous
            </Button>
            <div className="text-sm text-muted-foreground">
              {Array.from({ length: questions.length }).map((_, i) => (
                <span 
                  key={i}
                  className={`inline-block w-2 h-2 rounded-full mx-1 ${
                    i === currentQuestion ? 'bg-primary' : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
            <Button 
              variant="outline" 
              onClick={handleNextQuestion} 
              disabled={currentQuestion === questions.length - 1}
            >
              Next
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuizPreview;
