
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
  
  // Tradução dos status
  const getStatusTranslation = (status: string) => {
    switch (status) {
      case 'not_started': return 'não iniciado';
      case 'in_progress': return 'em andamento';
      case 'completed': return 'concluído';
      case 'late': return 'atrasado';
      default: return status.replace('_', ' ');
    }
  };
  
  return (
    <div className="mb-4">
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Esta lição faz parte das suas tarefas.
          Status: <span className="font-medium">{getStatusTranslation(assignment.status)}</span>
          {assignment.due_date && (
            <> · Prazo: {new Date(assignment.due_date).toLocaleDateString()}</>
          )}
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default AssignmentAlert;
