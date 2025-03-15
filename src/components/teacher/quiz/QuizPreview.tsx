
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Question } from './types';

interface QuizPreviewProps {
  questions: Question[];
  title: string;
  passPercent: number;
  isPreview?: boolean;
}

const QuizPreview: React.FC<QuizPreviewProps> = ({
  questions,
  title,
  passPercent,
  isPreview = false
}) => {
  if (!questions.length) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No questions available for this quiz</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">{title}</h2>
        <Badge variant="outline" className="bg-muted">
          Pass mark: {passPercent}%
        </Badge>
      </div>
      
      <div className="space-y-4">
        {questions.map((question, index) => (
          <Card key={question.id || `preview-${index}`} className="border border-border/40">
            <CardHeader className="px-4 py-3 border-b border-border/40 bg-muted/20">
              <CardTitle className="text-base font-medium">
                Question {index + 1}: {question.question_text}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-2">
                {question.options?.map((option, optIndex) => (
                  <div 
                    key={option.id || `preview-opt-${index}-${optIndex}`} 
                    className={`p-3 rounded-md border ${
                      option.is_correct && isPreview 
                        ? 'border-green-200 bg-green-50' 
                        : 'border-border/40 bg-card'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div 
                        className={`flex-shrink-0 h-5 w-5 rounded-full flex items-center justify-center text-xs ${
                          option.is_correct && isPreview 
                            ? 'bg-green-500 text-white' 
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {String.fromCharCode(65 + optIndex)}
                      </div>
                      <div>{option.option_text}</div>
                      
                      {option.is_correct && isPreview && (
                        <Badge className="ml-auto" variant="outline">Correct</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default QuizPreview;
