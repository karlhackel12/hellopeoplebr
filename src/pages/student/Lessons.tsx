
import React from 'react';
import StudentLayout from '@/components/layout/StudentLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { BookOpen, Clock, ArrowRight, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format } from 'date-fns';
import AssignmentCard from '@/components/student/AssignmentCard';

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
  const pendingAssignments = assignments?.filter(a => a.status === 'not_started') || [];
  const inProgressAssignments = assignments?.filter(a => a.status === 'in_progress') || [];
  const completedAssignments = assignments?.filter(a => a.status === 'completed') || [];

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
            <RenderAssignments 
              assignments={assignments} 
              isLoading={isLoading} 
              getProgress={getLessonProgress} 
            />
          </TabsContent>
          
          <TabsContent value="pending" className="mt-6">
            <RenderAssignments 
              assignments={pendingAssignments} 
              isLoading={isLoading} 
              emptyMessage="No pending assignments"
              getProgress={getLessonProgress} 
            />
          </TabsContent>
          
          <TabsContent value="in-progress" className="mt-6">
            <RenderAssignments 
              assignments={inProgressAssignments} 
              isLoading={isLoading}
              emptyMessage="No assignments in progress" 
              getProgress={getLessonProgress} 
            />
          </TabsContent>
          
          <TabsContent value="completed" className="mt-6">
            <RenderAssignments 
              assignments={completedAssignments} 
              isLoading={isLoading}
              emptyMessage="No completed assignments" 
              getProgress={getLessonProgress} 
            />
          </TabsContent>
        </Tabs>
      </div>
    </StudentLayout>
  );
};

interface RenderAssignmentsProps {
  assignments?: any[];
  isLoading: boolean;
  emptyMessage?: string;
  getProgress: (lessonId: string) => any;
}

const RenderAssignments: React.FC<RenderAssignmentsProps> = ({ 
  assignments, 
  isLoading, 
  emptyMessage = "No assignments found", 
  getProgress 
}) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary/70" />
      </div>
    );
  }
  
  if (!assignments || assignments.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 gap-4">
      {assignments.map((assignment) => (
        <AssignmentCard 
          key={assignment.id}
          assignment={assignment}
          progress={assignment.lesson_id ? getProgress(assignment.lesson_id) : null}
        />
      ))}
    </div>
  );
};

export default StudentLessons;
