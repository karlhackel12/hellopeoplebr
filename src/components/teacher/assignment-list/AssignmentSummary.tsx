
import React from 'react';
import { UsersIcon } from 'lucide-react';

interface AssignmentSummaryProps {
  assignments: any[];
  filteredCount: number;
}

const AssignmentSummary: React.FC<AssignmentSummaryProps> = ({ 
  assignments,
  filteredCount
}) => {
  const uniqueStudents = assignments.reduce((acc, curr) => {
    const studentId = curr.student?.id;
    return studentId && !acc.includes(studentId) ? [...acc, studentId] : acc;
  }, []);
  
  return (
    <div className="flex items-center justify-between bg-muted/50 p-4 rounded-lg text-sm">
      <div className="flex items-center gap-2">
        <UsersIcon className="h-4 w-4 text-muted-foreground" />
        <span>{uniqueStudents.length} students assigned</span>
      </div>
      <div>Showing {filteredCount} of {assignments.length} assignments</div>
    </div>
  );
};

export default AssignmentSummary;
