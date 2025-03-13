
import React from 'react';
import { Question } from '@/components/teacher/quiz/types';

interface QuizQuestionListProps {
  questions: Question[];
}

const QuizQuestionList: React.FC<QuizQuestionListProps> = ({ questions }) => {
  return (
    <div className="space-y-4">
      <h4 className="font-medium">Questions ({questions.length})</h4>
      {questions.map((question, index) => (
        <div key={question.id} className="border rounded-lg p-4">
          <div className="flex justify-between">
            <h5 className="font-medium">Question {index + 1}</h5>
            <span className="text-sm text-muted-foreground">
              {question.points} {question.points === 1 ? 'point' : 'points'}
            </span>
          </div>
          <p className="my-2">{question.question_text}</p>
          
          {question.options && (
            <ul className="space-y-2 mt-3">
              {question.options.map((option) => (
                <li 
                  key={option.id} 
                  className={`p-2 rounded ${option.is_correct ? 'bg-green-50 border-green-200 border' : 'bg-gray-50 border-gray-200 border'}`}
                >
                  {option.option_text}
                  {option.is_correct && (
                    <span className="ml-2 text-xs text-green-600 font-medium">✓ Correct</span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
};

export default QuizQuestionList;
