
import React from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Question } from '../quiz/types';
import QuizPreview from '../quiz/QuizPreview';

interface QuizTabProps {
  lessonId?: string;
  loadingQuiz: boolean;
  quizExists: boolean;
  quizQuestions: Question[];
  quizTitle: string;
  quizPassPercent: number;
  isQuizPublished: boolean;
}

const QuizTab: React.FC<QuizTabProps> = ({
  lessonId,
  loadingQuiz,
  quizExists,
  quizQuestions,
  quizTitle,
  quizPassPercent,
  isQuizPublished
}) => {
  if (!lessonId) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Quiz will be available after you save the lesson</p>
      </div>
    );
  }

  if (loadingQuiz) {
    return (
      <div className="text-center py-8">
        <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
        <p className="text-muted-foreground">Loading quiz data...</p>
      </div>
    );
  }

  if (!quizExists) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No quiz has been created for this lesson yet</p>
      </div>
    );
  }

  if (quizQuestions.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">This lesson has a quiz, but no questions have been added yet</p>
      </div>
    );
  }

  return (
    <div>
      {!isQuizPublished && (
        <div className="mb-4 p-2 bg-amber-50 border border-amber-200 rounded-md flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200">
              Draft
            </Badge>
            <p className="text-sm text-amber-700">
              This quiz is in draft mode and would not be visible to students until published
            </p>
          </div>
        </div>
      )}
      <QuizPreview 
        questions={quizQuestions} 
        title={quizTitle}
        passPercent={quizPassPercent}
        isPreview={true}
      />
    </div>
  );
};

export default QuizTab;
