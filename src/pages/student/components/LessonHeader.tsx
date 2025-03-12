
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CheckCircle } from 'lucide-react';

interface LessonHeaderProps {
  title: string;
  isCompleted: boolean;
  onMarkComplete: () => void;
  isUpdating: boolean;
}

const LessonHeader: React.FC<LessonHeaderProps> = ({
  title,
  isCompleted,
  onMarkComplete,
  isUpdating
}) => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => navigate('/student/lessons')}
          className="mb-2"
        >
          <ArrowLeft className="mr-1 h-4 w-4" /> Back to Lessons
        </Button>
        <h1 className="text-2xl font-bold">{title}</h1>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-2">
        {isCompleted ? (
          <div className="flex items-center text-green-600 px-3 py-1 rounded-md bg-green-50">
            <CheckCircle className="h-4 w-4 mr-2" />
            <span>Completed</span>
          </div>
        ) : (
          <Button 
            onClick={onMarkComplete}
            disabled={isUpdating}
          >
            Mark as Complete
          </Button>
        )}
      </div>
    </div>
  );
};

export default LessonHeader;
