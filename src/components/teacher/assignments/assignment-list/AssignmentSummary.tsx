
import React from 'react';

interface AssignmentSummaryProps {
  assignments: any[];
  filteredCount: number;
}

const AssignmentSummary: React.FC<AssignmentSummaryProps> = ({ assignments, filteredCount }) => {
  // Count assignments by status
  const notStarted = assignments.filter(a => a.status === 'not_started').length;
  const inProgress = assignments.filter(a => a.status === 'in_progress').length;
  const completed = assignments.filter(a => a.status === 'completed').length;
  
  return (
    <div className="bg-muted/50 p-4 rounded-lg">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
        <div>
          <p className="text-sm text-muted-foreground">Total</p>
          <p className="text-2xl font-semibold">{assignments.length}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Not Started</p>
          <p className="text-2xl font-semibold">{notStarted}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">In Progress</p>
          <p className="text-2xl font-semibold">{inProgress}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Completed</p>
          <p className="text-2xl font-semibold">{completed}</p>
        </div>
      </div>
      
      {filteredCount !== assignments.length && (
        <p className="text-sm text-muted-foreground text-center mt-4">
          Showing {filteredCount} of {assignments.length} assignments based on current filters
        </p>
      )}
    </div>
  );
};

export default AssignmentSummary;
