
import React from 'react';
import { ClipboardListIcon } from 'lucide-react';

interface AssignmentContentTypeProps {
  assignment: any;
}

const AssignmentContentType: React.FC<AssignmentContentTypeProps> = ({ assignment }) => {
  if (assignment.quiz_id) {
    return (
      <div className="flex items-center">
        <ClipboardListIcon className="h-4 w-4 mr-1 text-purple-500" />
        <span>Quiz: {assignment.quiz?.title || 'Unknown'}</span>
      </div>
    );
  }
  
  return <span>Unknown content</span>;
};

export default AssignmentContentType;
