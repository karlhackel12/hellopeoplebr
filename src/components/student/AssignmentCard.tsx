
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Clock, ArrowRight, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

interface AssignmentCardProps {
  assignment: any;
  progress: any;
}

const AssignmentCard: React.FC<AssignmentCardProps> = ({ assignment, progress }) => {
  const navigate = useNavigate();
  const isLesson = !!assignment.lesson_id;
  const assignmentTitle = isLesson 
    ? assignment.lessons?.title 
    : assignment.quizzes?.title;
  
  const handleNavigate = () => {
    if (isLesson) {
      navigate(`/student/lessons/view/${assignment.lesson_id}`);
    } else if (assignment.quiz_id) {
      navigate(`/student/quizzes/view/${assignment.quiz_id}`);
    }
  };
  
  const assignmentType = isLesson ? 'Lesson' : 'Quiz';
  
  let statusBadge;
  switch (assignment.status) {
    case 'not_started':
      statusBadge = <Badge variant="outline">Not Started</Badge>;
      break;
    case 'in_progress':
      statusBadge = <Badge variant="secondary">In Progress</Badge>;
      break;
    case 'completed':
      statusBadge = <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-200">Completed</Badge>;
      break;
    default:
      statusBadge = <Badge variant="outline">Pending</Badge>;
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <CardTitle>{assignment.title}</CardTitle>
            <CardDescription>
              {assignmentType}: {assignmentTitle}
            </CardDescription>
          </div>
          {statusBadge}
        </div>
      </CardHeader>
      <CardContent>
        {assignment.description && (
          <p className="text-sm text-muted-foreground mb-4">{assignment.description}</p>
        )}
        
        <div className="flex flex-wrap gap-2 mb-4">
          {assignment.due_date && (
            <div className="flex items-center text-sm text-muted-foreground">
              <Clock className="mr-1 h-4 w-4" />
              Due: {format(new Date(assignment.due_date), 'MMM d, yyyy')}
            </div>
          )}
          
          {isLesson && assignment.lessons?.estimated_minutes && (
            <div className="flex items-center text-sm text-muted-foreground">
              <BookOpen className="mr-1 h-4 w-4" />
              {assignment.lessons.estimated_minutes} min
            </div>
          )}
        </div>
        
        <Button onClick={handleNavigate} className="w-full group">
          {isLesson ? (
            <>
              <BookOpen className="mr-2 h-4 w-4 transition-transform group-hover:scale-110" />
              {progress?.completed ? 'Review Lesson' : 'Start Lesson'}
            </>
          ) : (
            <>
              <BookOpen className="mr-2 h-4 w-4 transition-transform group-hover:scale-110" />
              View Quiz
            </>
          )}
          <ArrowRight className="ml-auto h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Button>
      </CardContent>
    </Card>
  );
};

export default AssignmentCard;
