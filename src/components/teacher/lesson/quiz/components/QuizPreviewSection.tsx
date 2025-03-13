
import React from 'react';
import { Card } from '@/components/ui/card';
import { Question } from '@/components/teacher/quiz/types';
import QuizPreviewHeader from '../QuizPreviewHeader';
import QuizPreviewContent from '../QuizPreviewContent';
import QuizPublishSwitch from './QuizPublishSwitch';
import QuizPublishAlert from './QuizPublishAlert';

interface QuizPreviewSectionProps {
  previewQuestions: Question[];
  showPreview: boolean;
  togglePreview: () => void;
  quizTitle: string;
  setQuizTitle: (title: string) => void;
  handleSaveQuiz: (title: string) => Promise<void>;
  handleDiscardQuiz: () => Promise<void>;
  saving: boolean;
  existingQuiz: boolean;
  isPublished: boolean;
  onTogglePublish: () => Promise<void>;
}

const QuizPreviewSection: React.FC<QuizPreviewSectionProps> = ({
  previewQuestions,
  showPreview,
  togglePreview,
  quizTitle,
  setQuizTitle,
  handleSaveQuiz,
  handleDiscardQuiz,
  saving,
  existingQuiz,
  isPublished,
  onTogglePublish
}) => {
  return (
    <Card>
      <QuizPreviewHeader 
        showPreview={showPreview} 
        togglePreview={togglePreview} 
      />
      
      {existingQuiz && (
        <QuizPublishSwitch
          isPublished={isPublished}
          onTogglePublish={onTogglePublish}
          saving={saving}
        />
      )}
      
      {existingQuiz && !isPublished && showPreview && (
        <div className="px-6 py-3 border-b">
          <QuizPublishAlert />
        </div>
      )}
      
      <QuizPreviewContent
        showPreview={showPreview}
        quizTitle={quizTitle}
        setQuizTitle={setQuizTitle}
        previewQuestions={previewQuestions}
        saveQuiz={() => handleSaveQuiz(quizTitle)}
        discardQuiz={handleDiscardQuiz}
        saving={saving}
        existingQuiz={existingQuiz}
      />
    </Card>
  );
};

export default QuizPreviewSection;
