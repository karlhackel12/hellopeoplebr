
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import TeacherLayout from '@/components/layout/TeacherLayout';
import AssignmentForm from '@/components/teacher/AssignmentForm';
import AssignmentsList from '@/components/teacher/AssignmentsList';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery } from '@tanstack/react-query';

const Assignments = () => {
  const [activeTab, setActiveTab] = useState('create');

  // Fetch assignments with React Query
  const { 
    data: assignments = [], 
    isLoading: loadingAssignments,
    refetch: refetchAssignments
  } = useQuery({
    queryKey: ['assignments'],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return [];

      const { data, error } = await supabase
        .from('student_assignments')
        .select(`
          *,
          student:student_id(id, first_name, last_name, avatar_url),
          lesson:lesson_id(id, title),
          quiz:quiz_id(id, title)
        `)
        .eq('assigned_by', user.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

  // Fetch students with React Query
  const { 
    data: students = [],
    isLoading: loadingStudents
  } = useQuery({
    queryKey: ['students'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, avatar_url')
        .eq('role', 'student');

      if (error) throw error;
      return data || [];
    }
  });

  // Fetch lessons and quizzes with React Query
  const { 
    data: contentData = { lessons: [], quizzes: [] },
    isLoading: loadingContent
  } = useQuery({
    queryKey: ['lessons-quizzes'],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return { lessons: [], quizzes: [] };

      // Parallel requests for better performance
      const [lessonsResponse, quizzesResponse] = await Promise.all([
        supabase
          .from('lessons')
          .select('id, title')
          .eq('created_by', user.user.id),
        
        supabase
          .from('quizzes')
          .select('id, title')
          .eq('created_by', user.user.id)
      ]);

      if (lessonsResponse.error) throw lessonsResponse.error;
      if (quizzesResponse.error) throw quizzesResponse.error;

      return { 
        lessons: lessonsResponse.data || [],
        quizzes: quizzesResponse.data || []
      };
    }
  });

  // Handle successful assignment creation
  const handleAssignmentSuccess = () => {
    refetchAssignments();
    // Switch to the view tab after creating
    setActiveTab('view');
  };

  return (
    <TeacherLayout>
      <div>
        <h1 className="text-3xl font-bold mb-6">Student Assignments</h1>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="create">Create Assignment</TabsTrigger>
            <TabsTrigger value="view">View Assignments</TabsTrigger>
          </TabsList>
          
          <TabsContent value="create" className="space-y-4">
            <div className="bg-card rounded-lg p-6 shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Assign Lesson or Quiz</h2>
              <AssignmentForm 
                students={students}
                lessons={contentData.lessons}
                quizzes={contentData.quizzes}
                onSuccess={handleAssignmentSuccess} 
              />
            </div>
          </TabsContent>
          
          <TabsContent value="view">
            <AssignmentsList 
              assignments={assignments} 
              loading={loadingAssignments} 
              onUpdate={refetchAssignments} 
            />
          </TabsContent>
        </Tabs>
      </div>
    </TeacherLayout>
  );
};

export default Assignments;
