
import React from 'react';
import { CheckCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

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
  const percentComplete = totalSections > 0 
    ? Math.round((completedSections.length / totalSections) * 100) 
    : 0;
  
  const getProgressColor = () => {
    if (percentComplete < 30) return 'bg-red-500';
    if (percentComplete < 70) return 'bg-amber-500';
    return 'bg-green-500';
  };
  
  return (
    <div className={cn("mt-8 border-t pt-4", className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium flex items-center">
          <CheckCircle className="h-4 w-4 mr-2 text-primary" />
          {customLabel || 'Progress'}
        </h3>
        <Badge 
          variant={percentComplete === 100 ? "default" : "outline"}
          className={percentComplete === 100 ? "bg-green-500" : ""}
        >
          {percentComplete === 100 ? 'Complete!' : `${percentComplete}%`}
        </Badge>
      </div>
      
      <Progress 
        value={percentComplete} 
        className="h-2 mb-2" 
        indicatorClassName={cn(getProgressColor())}
      />
      
      <div className="flex justify-between items-center mt-3">
        <p className="text-sm text-muted-foreground">
          {completedSections.length} of {totalSections} {customLabel ? 'steps' : 'sections'} completed
        </p>
        
        {percentComplete === 100 ? (
          <p className="text-sm text-green-600 font-medium">
            All sections completed!
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">
            {totalSections - completedSections.length} remaining
          </p>
        )}
      </div>
    </div>
  );
};

export default ProgressTracker;
