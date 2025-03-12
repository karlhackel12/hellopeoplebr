
import React from 'react';
import { Card } from '@/components/ui/card';
import { Question } from '@/components/teacher/quiz/types';
import QuizPreviewHeader from '../QuizPreviewHeader';
import QuizPreviewContent from '../QuizPreviewContent';
import QuizPublishSwitch from './QuizPublishSwitch';

interface QuizPreviewSectionProps {
  previewQuestions: Question[];
  showPreview: boolean;
  togglePreview: () => void;
  quizTitle: string;
  setQuizTitle: (title: string) => void;
  handleSaveQuiz: () => Promise<void>;
  handleDiscardQuiz: () => Promise<void>;
  saving: boolean;
  existingQuiz: boolean;
  isPublished: boolean;
  onTogglePublish: () => void;
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
      
      <QuizPreviewContent
        showPreview={showPreview}
        quizTitle={quizTitle}
        setQuizTitle={setQuizTitle}
        previewQuestions={previewQuestions}
        saveQuiz={handleSaveQuiz}
        discardQuiz={handleDiscardQuiz}
        saving={saving}
        existingQuiz={existingQuiz}
      />
    </Card>
  );
};

export default QuizPreviewSection;
