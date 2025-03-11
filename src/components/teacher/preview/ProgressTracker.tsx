
import React from 'react';
import { CheckCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface ProgressTrackerProps {
  completedSections: string[];
  totalSections?: number;
  customLabel?: string;
  className?: string;
}

const ProgressTracker: React.FC<ProgressTrackerProps> = ({ 
  completedSections,
  totalSections = 7,
  customLabel,
  className
}) => {
  const percentComplete = (completedSections.length / totalSections) * 100;
  
  return (
    <div className={cn("mt-8 border-t pt-4", className)}>
      <h3 className="text-lg font-medium mb-4 flex items-center">
        <CheckCircle className="h-4 w-4 mr-2 text-primary" />
        {customLabel || 'Progress'}
      </h3>
      <Progress value={percentComplete} className="h-2 mb-2" />
      <p className="text-sm text-muted-foreground">
        {completedSections.length} of {totalSections} {customLabel ? 'steps' : 'sections'} completed
      </p>
    </div>
  );
};

export default ProgressTracker;
