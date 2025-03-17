
import React from 'react';
import { ClipboardListIcon } from 'lucide-react';

const AssignmentsEmptyState: React.FC = () => {
  return (
    <div className="bg-muted p-8 rounded-lg text-center">
      <ClipboardListIcon className="mx-auto h-10 w-10 text-muted-foreground mb-4" />
      <h3 className="text-xl font-medium mb-2">Nenhuma tarefa criada</h3>
      <p className="text-muted-foreground mb-4">Quando você criar tarefas para os alunos, elas aparecerão aqui.</p>
    </div>
  );
};

export default AssignmentsEmptyState;
