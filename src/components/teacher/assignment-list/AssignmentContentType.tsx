
import React from 'react';
import { BookOpenIcon, ClipboardListIcon } from 'lucide-react';

interface AssignmentContentTypeProps {
  assignment: any;
}

const AssignmentContentType: React.FC<AssignmentContentTypeProps> = ({ assignment }) => {
  if (assignment.lesson_id) {
    return (
      <div className="flex items-center">
        <BookOpenIcon className="h-4 w-4 mr-1 text-blue-500" />
        <span>Lesson: {assignment.lesson?.title || 'Unknown'}</span>
      </div>
    );
  } else if (assignment.quiz_id) {
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
