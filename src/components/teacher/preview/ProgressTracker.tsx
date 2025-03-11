
import React from 'react';
import { CheckCircle } from 'lucide-react';

interface ProgressTrackerProps {
  completedSections: string[];
}

const ProgressTracker: React.FC<ProgressTrackerProps> = ({ completedSections }) => {
  return (
    <div className="mt-8 border-t pt-4">
      <h3 className="text-lg font-medium mb-4 flex items-center">
        <CheckCircle className="h-4 w-4 mr-2" />
        Progress
      </h3>
      <div className="bg-muted rounded-full h-2 mb-2">
        <div 
          className="bg-primary h-2 rounded-full" 
          style={{ width: `${completedSections.length * 14.3}%` }}
        ></div>
      </div>
      <p className="text-sm text-muted-foreground">
        {completedSections.length} of 7 sections completed
      </p>
    </div>
  );
};

export default ProgressTracker;
