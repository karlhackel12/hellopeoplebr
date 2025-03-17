
import React from 'react';
import { format } from 'date-fns';
import AssignmentStatusBadge from './AssignmentStatusBadge';
import AssignmentContentType from './AssignmentContentType';
import DeleteAssignmentButton from './DeleteAssignmentButton';
import { Badge } from '@/components/ui/badge';

interface AssignmentsTableProps {
  assignments: any[];
  onUpdate: () => void;
}

const AssignmentsTable: React.FC<AssignmentsTableProps> = ({ 
  assignments,
  onUpdate
}) => {
  if (assignments.length === 0) {
    return (
      <div className="bg-card rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left">Tarefa</th>
                <th className="px-4 py-3 text-left">Aluno</th>
                <th className="px-4 py-3 text-left">Conteúdo</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Data de Entrega</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                  Nenhuma tarefa corresponde aos seus filtros. Tente ajustar sua busca ou filtros.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted text-muted-foreground">
            <tr>
              <th className="px-4 py-3 text-left">Tarefa</th>
              <th className="px-4 py-3 text-left">Aluno</th>
              <th className="px-4 py-3 text-left">Conteúdo</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Data de Entrega</th>
              <th className="px-4 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {assignments.map((assignment) => (
              <tr key={assignment.id}>
                <td className="px-4 py-3">
                  <div>
                    <div className="font-medium">{assignment.title}</div>
                    {assignment.description && (
                      <div className="text-sm text-muted-foreground truncate max-w-[200px]">
                        {assignment.description}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  {assignment.student ? (
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
                        {assignment.student.first_name?.[0]}{assignment.student.last_name?.[0]}
                      </div>
                      <span>
                        {assignment.student.first_name} {assignment.student.last_name}
                      </span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">Aluno desconhecido</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="space-y-1">
                    <AssignmentContentType assignment={assignment} />
                    
                    {assignment.quiz_id && (
                      <div className="flex items-center">
                        <Badge variant="outline" className="text-xs bg-purple-50 border-purple-200">
                          Tem Quiz
                        </Badge>
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <AssignmentStatusBadge status={assignment.status} />
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground">
                  {assignment.due_date 
                    ? format(new Date(assignment.due_date), 'dd/MM/yyyy')
                    : 'Sem data de entrega'
                  }
                </td>
                <td className="px-4 py-3 text-right">
                  <DeleteAssignmentButton 
                    assignmentId={assignment.id} 
                    onDelete={onUpdate} 
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AssignmentsTable;
