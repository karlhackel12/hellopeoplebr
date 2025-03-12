
import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const QuizPublishAlert: React.FC = () => {
  return (
    <Alert variant="destructive" className="mt-4">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>
        This quiz is in draft mode and won't be visible to students. Publish it when you're ready for students to take it.
      </AlertDescription>
    </Alert>
  );
};

export default QuizPublishAlert;
