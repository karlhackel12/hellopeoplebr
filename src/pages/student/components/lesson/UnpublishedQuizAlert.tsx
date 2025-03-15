
import React from 'react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from 'lucide-react';

interface UnpublishedQuizAlertProps {
  hasUnpublishedQuiz: boolean;
}

const UnpublishedQuizAlert: React.FC<UnpublishedQuizAlertProps> = ({ hasUnpublishedQuiz }) => {
  if (!hasUnpublishedQuiz) return null;
  
  return (
    <Alert className="bg-amber-50 text-amber-800 border-amber-200">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>
        There is a quiz for this lesson, but it hasn't been published yet.
      </AlertDescription>
    </Alert>
  );
};

export default UnpublishedQuizAlert;
