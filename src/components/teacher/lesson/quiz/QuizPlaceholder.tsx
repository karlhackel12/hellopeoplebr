
import React from 'react';
import { FileQuestion } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const QuizPlaceholder: React.FC = () => {
  return (
    <Card className="p-6">
      <CardContent className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <FileQuestion className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-xl font-medium mb-2">No Lesson Selected</h3>
        <p className="text-muted-foreground">
          Select a lesson to create or manage quizzes for that lesson.
        </p>
      </CardContent>
    </Card>
  );
};

export default QuizPlaceholder;
