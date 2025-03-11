
import React from 'react';
import { format } from 'date-fns';
import AssignmentStatusBadge from './AssignmentStatusBadge';
import AssignmentContentType from './AssignmentContentType';
import DeleteAssignmentButton from './DeleteAssignmentButton';

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
                <th className="px-4 py-3 text-left">Assignment</th>
                <th className="px-4 py-3 text-left">Student</th>
                <th className="px-4 py-3 text-left">Content</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Due Date</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                  No assignments match your filters. Try adjusting your search or filters.
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
              <th className="px-4 py-3 text-left">Assignment</th>
              <th className="px-4 py-3 text-left">Student</th>
              <th className="px-4 py-3 text-left">Content</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Due Date</th>
              <th className="px-4 py-3 text-right">Actions</th>
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
                    <span className="text-muted-foreground">Unknown student</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <AssignmentContentType assignment={assignment} />
                </td>
                <td className="px-4 py-3">
                  <AssignmentStatusBadge status={assignment.status} />
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground">
                  {assignment.due_date 
                    ? format(new Date(assignment.due_date), 'MMM dd, yyyy')
                    : 'No due date'
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
