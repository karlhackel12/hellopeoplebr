
import React from 'react';
import { FileQuestion } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const AssignmentsEmptyState: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div className="flex flex-col items-center justify-center p-8 bg-gray-50 rounded-lg border border-dashed border-gray-300 text-center">
      <FileQuestion className="h-12 w-12 text-gray-400 mb-4" />
      <h3 className="text-lg font-medium mb-2">No assignments yet</h3>
      <p className="text-sm text-muted-foreground mb-4 max-w-md">
        You haven't created any assignments for your students yet. Create an assignment to help your students learn.
      </p>
      <Button onClick={() => navigate('/teacher/assignments', { state: { initialTab: 'create' } })}>
        Create Your First Assignment
      </Button>
    </div>
  );
};

export default AssignmentsEmptyState;
