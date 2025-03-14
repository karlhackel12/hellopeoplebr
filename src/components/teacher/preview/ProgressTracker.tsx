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
  return;
};
export default ProgressTracker;