
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
  const percentComplete = totalSections > 0 ? Math.round(completedSections.length / totalSections * 100) : 0;
  
  return (
    <div className={cn("py-[5px] my-[60px]", className)}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm text-muted-foreground">
          {customLabel || `${completedSections.length} of ${totalSections} complete`}
        </p>
        <Badge variant={percentComplete === 100 ? "default" : "outline"} className={cn("text-xs", percentComplete === 100 ? "bg-green-500" : "")}>
          {percentComplete}%
        </Badge>
      </div>
      
      <Progress value={percentComplete} className="h-1" indicatorClassName={cn(percentComplete === 100 ? "bg-green-500" : "bg-primary")} />
    </div>
  );
};

export default ProgressTracker;
