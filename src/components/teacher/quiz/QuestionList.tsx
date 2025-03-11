
import React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { PlusCircle, MinusCircle } from 'lucide-react';
import { Question } from './types';

interface QuestionListProps {
  questions: Question[];
  onEditQuestion: (question: Question) => void;
  onDeleteQuestion: (questionId: string) => void;
}

const QuestionList: React.FC<QuestionListProps> = ({
  questions,
  onEditQuestion,
  onDeleteQuestion,
}) => {
  if (questions.length === 0) {
    return (
      <div className="text-center py-12 border rounded-md bg-muted">
        <p className="text-muted-foreground">No questions added yet</p>
        <Button variant="outline" onClick={() => {}} className="mt-4">
          Add your first question
        </Button>
      </div>
    );
  }

  return (
    <Accordion type="single" collapsible className="mb-8">
      {questions.map((question, index) => (
        <AccordionItem key={question.id} value={question.id}>
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center">
              <span className="text-muted-foreground mr-2">Q{index + 1}.</span>
              <span>{question.question_text}</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="pl-6 pr-2 pb-2">
              <div className="mb-2">
                <span className="text-sm font-medium">Type:</span>{' '}
                <span className="text-sm capitalize">{question.question_type.replace('_', ' ')}</span>
              </div>
              <div className="mb-4">
                <span className="text-sm font-medium">Points:</span>{' '}
                <span className="text-sm">{question.points}</span>
              </div>
              
              <div className="mb-4">
                <span className="text-sm font-medium">Options:</span>
                <ul className="mt-2 space-y-2">
                  {question.options?.map((option) => (
                    <li key={option.id} className="flex items-center">
                      <div className={`w-4 h-4 rounded-full mr-2 ${option.is_correct ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      <span>{option.option_text}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={() => onEditQuestion(question)} className="gap-1">
                  <PlusCircle className="h-4 w-4" />
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDeleteQuestion(question.id)}
                  className="text-destructive gap-1"
                >
                  <MinusCircle className="h-4 w-4" />
                  Delete
                </Button>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
};

export default QuestionList;
