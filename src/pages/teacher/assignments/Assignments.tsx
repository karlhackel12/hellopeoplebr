
import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import TeacherLayout from '@/components/layout/TeacherLayout';
import AssignmentForm from '@/components/teacher/assignments/assignment-list/AssignmentForm';
import AssignmentsList from '@/components/teacher/assignments/assignment-list/AssignmentsList';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery } from '@tanstack/react-query';

const Assignments = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('create');
  const initialStudentId = location.state?.studentId;
  const studentName = location.state?.studentName;
  const initialTab = location.state?.initialTab;

  // Set initial tab based on navigation state
  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Fetch assignments with React Query - improved query to get all related data
  const { data: assignments = [], isLoading: loadingAssignments, refetch: refetchAssignments } = useQuery({
    queryKey: ['assignments', initialStudentId],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return [];

      // Enhanced query with explicit selections
      let query = supabase
        .from('student_assignments')
        .select(`
          id,
          title,
          description,
          student_id,
          assigned_by,
          quiz_id,
          due_date,
          started_at,
          completed_at,
          created_at,
          updated_at,
          status,
          student:student_id(id, first_name, last_name, avatar_url),
          quiz:quiz_id(id, title)
        `)
        .eq('assigned_by', user.user.id);

      // Add student filter if provided
      if (initialStudentId) {
        query = query.eq('student_id', initialStudentId);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching assignments:', error);
        toast.error('Error loading assignments', {
          description: error.message,
        });
        return [];
      }

      return data || [];
    }
  });

  // Fetch students with React Query
  const { data: students = [], isLoading: loadingStudents } = useQuery({
    queryKey: ['students'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, avatar_url')
        .eq('role', 'student');

      if (error) {
        console.error('Error fetching students:', error);
        toast.error('Error loading students');
        return [];
      }

      return data || [];
    }
  });

  // Fetch quizzes for assignment creation
  const { data: quizzes = [], isLoading: loadingQuizzes } = useQuery({
    queryKey: ['assignable-quizzes'],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return [];

      const { data, error } = await supabase
        .from('quizzes')
        .select('id, title, is_published')
        .eq('created_by', user.user.id)
        .order('title');

      if (error) {
        console.error('Error fetching quizzes:', error);
        return [];
      }

      return data || [];
    }
  });

  // Handle successful assignment creation
  const handleAssignmentSuccess = () => {
    refetchAssignments();
    // Switch to the view tab after creating
    setActiveTab('view');
  };

  const isLoading = loadingStudents || loadingQuizzes;

  return (
    <TeacherLayout>
      <div className="animate-fade-in">
        <h1 className="text-3xl font-bold mb-6">
          {studentName ? `Assignments for ${studentName}` : 'Student Assignments'}
        </h1>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="mb-6">
            <TabsTrigger value="create">Create Assignment</TabsTrigger>
            <TabsTrigger value="view">View Assignments</TabsTrigger>
          </TabsList>

          <TabsContent value="create" className="space-y-4">
            <div className="bg-card rounded-lg p-6 shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Assign Content to Student</h2>
              <AssignmentForm
                students={students}
                quizzes={quizzes}
                onSuccess={handleAssignmentSuccess}
                initialStudentId={initialStudentId}
                isLoading={isLoading}
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
