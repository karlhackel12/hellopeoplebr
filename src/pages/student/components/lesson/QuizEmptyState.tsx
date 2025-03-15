
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

const QuizEmptyState: React.FC = () => {
  return (
    <Card className="border shadow-sm">
      <CardContent className="py-12">
        <div className="text-center">
          <p className="text-muted-foreground">No questions available for this quiz.</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuizEmptyState;
