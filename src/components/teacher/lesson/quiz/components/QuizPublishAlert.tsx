
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

const QuizPublishAlert: React.FC = () => {
  return (
    <Alert variant="warning" className="bg-amber-50 border-amber-200">
      <AlertCircle className="h-4 w-4 text-amber-600" />
      <AlertTitle className="text-amber-800">Quiz in Draft Mode</AlertTitle>
      <AlertDescription className="text-amber-700">
        This quiz is currently in draft mode. Students will not be able to see it
        until you publish it using the switch above.
      </AlertDescription>
    </Alert>
  );
};

export default QuizPublishAlert;
