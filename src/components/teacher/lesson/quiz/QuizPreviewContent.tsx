
import React from 'react';
import { CardContent } from '@/components/ui/card';
import { Question } from '@/components/teacher/quiz/types';
import QuizTitleEditor from './QuizTitleEditor';
import QuizQuestionList from './QuizQuestionList';
import QuizActions from './QuizActions';

interface QuizPreviewContentProps {
  showPreview: boolean;
  quizTitle: string;
  setQuizTitle: (title: string) => void;
  previewQuestions: Question[];
  saveQuiz: () => Promise<void>;
  discardQuiz: () => Promise<void>;
  saving: boolean;
  existingQuiz: boolean;
}

const QuizPreviewContent: React.FC<QuizPreviewContentProps> = ({
  showPreview,
  quizTitle,
  setQuizTitle,
  previewQuestions,
  saveQuiz,
  discardQuiz,
  saving,
  existingQuiz
}) => {
  if (!showPreview) return null;
  
  return (
    <CardContent>
      <div className="space-y-6">
        <div className="grid gap-4">
          {/* Quiz Title */}
          <QuizTitleEditor quizTitle={quizTitle} setQuizTitle={setQuizTitle} />
          
          {/* Questions Preview */}
          <QuizQuestionList questions={previewQuestions} />
        </div>
        
        {/* Actions */}
        <QuizActions 
          onSave={saveQuiz} 
          onDiscard={discardQuiz} 
          saving={saving} 
          existingQuiz={existingQuiz} 
        />
      </div>
    </CardContent>
  );
};

export default QuizPreviewContent;
