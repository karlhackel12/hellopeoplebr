
import React from 'react';
import StudentLayout from '@/components/layout/StudentLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { BookOpen, Clock, ArrowRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

const StudentLessons: React.FC = () => {
  // Fetch student assignments (lessons and quizzes)
  const { data: assignments, isLoading: loadingAssignments } = useQuery({
    queryKey: ['student-lesson-assignments'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('student_assignments')
        .select(`
          id,
          title,
          description,
          due_date,
          status,
          created_at,
          lesson_id,
          quiz_id,
          lessons:lesson_id (
            id, 
            title, 
            content,
            estimated_minutes
          ),
          quizzes:quiz_id (
            id, 
            title
          )
        `)
        .eq('student_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch lesson progress
  const { data: progressData, isLoading: loadingProgress } = useQuery({
    queryKey: ['student-all-lesson-progress'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('user_lesson_progress')
        .select('lesson_id, completed, last_accessed_at')
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      // Convert to a map for easy lookup
      const progressMap = new Map();
      data?.forEach(item => {
        progressMap.set(item.lesson_id, item);
      });
      
      return progressMap;
    }
  });

  const isLoading = loadingAssignments || loadingProgress;
  
  // Filter assignments by type and status
  const lessonAssignments = assignments?.filter(a => a.lesson_id) || [];
  const quizAssignments = assignments?.filter(a => a.quiz_id) || [];
  
  const inProgressAssignments = assignments?.filter(a => a.status === 'in_progress') || [];
  const completedAssignments = assignments?.filter(a => a.status === 'completed') || [];
  const pendingAssignments = assignments?.filter(a => a.status === 'not_started') || [];

  function getLessonProgress(lessonId: string) {
    if (!progressData) return null;
    return progressData.get(lessonId);
  }

  return (
    <StudentLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">My Lessons</h1>
            <p className="text-muted-foreground">View all your assigned lessons and quizzes</p>
          </div>
        </div>

        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">All Assignments</TabsTrigger>
            <TabsTrigger value="pending">Not Started</TabsTrigger>
            <TabsTrigger value="in-progress">In Progress</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="mt-6">
            <div className="grid grid-cols-1 gap-4">
              {isLoading ? (
                <div className="text-center py-8">Loading assignments...</div>
              ) : assignments?.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No assignments found
                </div>
              ) : (
                assignments?.map((assignment) => (
                  <AssignmentCard 
                    key={assignment.id}
                    assignment={assignment}
                    progress={assignment.lesson_id ? getLessonProgress(assignment.lesson_id) : null}
                  />
                ))
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="pending" className="mt-6">
            <div className="grid grid-cols-1 gap-4">
              {isLoading ? (
                <div className="text-center py-8">Loading...</div>
              ) : pendingAssignments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No pending assignments
                </div>
              ) : (
                pendingAssignments.map((assignment) => (
                  <AssignmentCard 
                    key={assignment.id}
                    assignment={assignment}
                    progress={assignment.lesson_id ? getLessonProgress(assignment.lesson_id) : null}
                  />
                ))
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="in-progress" className="mt-6">
            <div className="grid grid-cols-1 gap-4">
              {isLoading ? (
                <div className="text-center py-8">Loading...</div>
              ) : inProgressAssignments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No assignments in progress
                </div>
              ) : (
                inProgressAssignments.map((assignment) => (
                  <AssignmentCard 
                    key={assignment.id}
                    assignment={assignment}
                    progress={assignment.lesson_id ? getLessonProgress(assignment.lesson_id) : null}
                  />
                ))
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="completed" className="mt-6">
            <div className="grid grid-cols-1 gap-4">
              {isLoading ? (
                <div className="text-center py-8">Loading...</div>
              ) : completedAssignments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No completed assignments
                </div>
              ) : (
                completedAssignments.map((assignment) => (
                  <AssignmentCard 
                    key={assignment.id}
                    assignment={assignment}
                    progress={assignment.lesson_id ? getLessonProgress(assignment.lesson_id) : null}
                  />
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </StudentLayout>
  );
};

interface AssignmentCardProps {
  assignment: any;
  progress: any;
}

const AssignmentCard: React.FC<AssignmentCardProps> = ({ assignment, progress }) => {
  const isLesson = !!assignment.lesson_id;
  const assignmentTitle = isLesson 
    ? assignment.lessons?.title 
    : assignment.quizzes?.title;
  
  const assignmentType = isLesson ? 'Lesson' : 'Quiz';
  const viewPath = isLesson 
    ? `/student/lessons/view/${assignment.lesson_id}` 
    : `/student/quizzes/view/${assignment.quiz_id}`;
  
  let statusBadge;
  switch (assignment.status) {
    case 'not_started':
      statusBadge = <Badge variant="outline">Not Started</Badge>;
      break;
    case 'in_progress':
      statusBadge = <Badge variant="secondary">In Progress</Badge>;
      break;
    case 'completed':
      statusBadge = <Badge variant="success" className="bg-green-100 text-green-800 hover:bg-green-200">Completed</Badge>;
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
        
        <Button asChild>
          <Link to={viewPath}>
            View {assignmentType} <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
};

export default StudentLessons;
