
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Clock } from 'lucide-react';

interface LessonAssignmentCardProps {
  title: string;
  description?: string;
  dueDate?: string;
}

const LessonAssignmentCard: React.FC<LessonAssignmentCardProps> = ({
  title,
  description,
  dueDate
}) => {
  return (
    <Card>
      <CardContent className="pt-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium">{title}</h3>
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
          </div>
          
          {dueDate && (
            <div className="flex items-center text-sm text-muted-foreground">
              <Clock className="mr-1 h-4 w-4" />
              Due: {new Date(dueDate).toLocaleDateString()}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default LessonAssignmentCard;
