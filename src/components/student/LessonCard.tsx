
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface LessonCardProps {
  lesson: {
    id: string;
    title: string;
    description?: string;
    is_published: boolean;
  };
  progress?: {
    completed: boolean;
    last_accessed_at?: string;
  };
  assignment?: {
    due_date?: string;
    status: 'not_started' | 'in_progress' | 'completed';
  };
}

const LessonCard: React.FC<LessonCardProps> = ({ lesson, progress, assignment }) => {
  const navigate = useNavigate();
  const isCompleted = progress?.completed;
  
  const handleLessonClick = () => {
    navigate(`/student/lessons/view/${lesson.id}`);
  };
  
  return (
    <Card className="h-full flex flex-col overflow-hidden border-2 border-transparent hover:border-primary/20 transition-all duration-300 cursor-pointer" onClick={handleLessonClick}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="line-clamp-2">{lesson.title}</CardTitle>
          {isCompleted && (
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
              <CheckCircle className="mr-1 h-3 w-3" /> Completed
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pb-0 flex-grow">
        {lesson.description && (
          <p className="text-sm text-muted-foreground line-clamp-3">
            {lesson.description}
          </p>
        )}
      </CardContent>
      
      <CardFooter className="pt-4">
        <Button className="w-full group">
          <BookOpen className="mr-2 h-4 w-4 transition-transform group-hover:scale-110" />
          {isCompleted ? 'Review Lesson' : 'Start Lesson'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default LessonCard;
