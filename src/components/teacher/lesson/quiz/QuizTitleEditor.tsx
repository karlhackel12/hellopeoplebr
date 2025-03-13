
import React from 'react';
import { Label } from '@/components/ui/label';

interface QuizTitleEditorProps {
  quizTitle: string;
  setQuizTitle: (title: string) => void;
}

const QuizTitleEditor: React.FC<QuizTitleEditorProps> = ({ quizTitle, setQuizTitle }) => {
  return (
    <div>
      <Label htmlFor="quiz-title">Quiz Title</Label>
      <input
        id="quiz-title"
        className="w-full p-2 border rounded mt-1"
        value={quizTitle}
        onChange={(e) => setQuizTitle(e.target.value)}
      />
    </div>
  );
};

export default QuizTitleEditor;
