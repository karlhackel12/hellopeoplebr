
import React from 'react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from 'lucide-react';

interface AssignmentAlertProps {
  assignment: {
    status: string;
    due_date?: string;
  } | null;
}

const AssignmentAlert: React.FC<AssignmentAlertProps> = ({ assignment }) => {
  if (!assignment) return null;
  
  return (
    <div className="mb-4">
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          This lesson is part of your assignments. 
          Status: <span className="font-medium">{assignment.status.replace('_', ' ')}</span>
          {assignment.due_date && (
            <> · Due: {new Date(assignment.due_date).toLocaleDateString()}</>
          )}
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default AssignmentAlert;
