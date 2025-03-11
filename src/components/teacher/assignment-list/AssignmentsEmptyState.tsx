
import React from 'react';
import { ClipboardListIcon } from 'lucide-react';

const AssignmentsEmptyState: React.FC = () => {
  return (
    <div className="bg-muted p-8 rounded-lg text-center">
      <ClipboardListIcon className="mx-auto h-10 w-10 text-muted-foreground mb-4" />
      <h3 className="text-xl font-medium mb-2">No assignments created</h3>
      <p className="text-muted-foreground mb-4">When you create assignments for students, they will appear here.</p>
    </div>
  );
};

export default AssignmentsEmptyState;
