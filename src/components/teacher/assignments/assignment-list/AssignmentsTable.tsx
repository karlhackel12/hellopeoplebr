
import React from 'react';
import { format } from 'date-fns';
import { Eye, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import AssignmentStatusBadge from './AssignmentStatusBadge';
import AssignmentContentType from './AssignmentContentType';
import DeleteAssignmentButton from './DeleteAssignmentButton';

interface AssignmentsTableProps {
  assignments: any[];
  onUpdate: () => void;
}

const AssignmentsTable: React.FC<AssignmentsTableProps> = ({ assignments, onUpdate }) => {
  if (assignments.length === 0) {
    return (
      <div className="text-center p-4 bg-muted/30 rounded-md">
        No assignments match your filters
      </div>
    );
  }

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Assignment</TableHead>
            <TableHead>Student</TableHead>
            <TableHead>Content</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        
        <TableBody>
          {assignments.map((assignment) => (
            <TableRow key={assignment.id}>
              <TableCell className="font-medium">
                {assignment.title}
              </TableCell>
              
              <TableCell>
                {assignment.student ? (
                  <div className="flex items-center gap-2">
                    {assignment.student.first_name} {assignment.student.last_name}
                  </div>
                ) : (
                  <span className="text-muted-foreground italic">Unknown student</span>
                )}
              </TableCell>
              
              <TableCell>
                <AssignmentContentType 
                  lessonId={assignment.lesson_id}
                  quizId={assignment.quiz_id}
                  lessonTitle={assignment.lesson?.title}
                  quizTitle={assignment.quiz?.title}
                />
              </TableCell>
              
              <TableCell>
                {assignment.due_date ? (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="mr-1 h-3 w-3" />
                    {format(new Date(assignment.due_date), 'MMM d, yyyy')}
                  </div>
                ) : (
                  <span className="text-muted-foreground italic">No due date</span>
                )}
              </TableCell>
              
              <TableCell>
                <AssignmentStatusBadge status={assignment.status} />
              </TableCell>
              
              <TableCell className="text-right">
                <div className="flex justify-end items-center space-x-1">
                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                  
                  <DeleteAssignmentButton 
                    assignmentId={assignment.id}
                    assignmentTitle={assignment.title}
                    onSuccess={onUpdate}
                  />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default AssignmentsTable;
