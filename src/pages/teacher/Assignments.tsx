
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import TeacherLayout from '@/components/layout/TeacherLayout';
import AssignmentForm from '@/components/teacher/AssignmentForm';
import AssignmentsList from '@/components/teacher/AssignmentsList';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Assignments = () => {
  const [loading, setLoading] = useState(false);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [lessons, setLessons] = useState<any[]>([]);
  const [quizzes, setQuizzes] = useState<any[]>([]);

  const fetchAssignments = async () => {
    setLoading(true);
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

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
      setAssignments(data || []);
    } catch (error: any) {
      console.error('Error fetching assignments:', error);
      toast.error('Failed to load assignments', {
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      // Fetch student profiles (role = 'student')
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, avatar_url')
        .eq('role', 'student');

      if (error) throw error;
      setStudents(data || []);
    } catch (error: any) {
      console.error('Error fetching students:', error);
      toast.error('Failed to load students', {
        description: error.message,
      });
    }
  };

  const fetchLessonsAndQuizzes = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      // Fetch lessons created by the teacher
      const { data: lessonsData, error: lessonsError } = await supabase
        .from('lessons')
        .select('id, title')
        .eq('created_by', user.user.id);

      if (lessonsError) throw lessonsError;
      setLessons(lessonsData || []);

      // Fetch quizzes created by the teacher
      const { data: quizzesData, error: quizzesError } = await supabase
        .from('quizzes')
        .select('id, title')
        .eq('created_by', user.user.id);

      if (quizzesError) throw quizzesError;
      setQuizzes(quizzesData || []);
    } catch (error: any) {
      console.error('Error fetching content:', error);
      toast.error('Failed to load lessons and quizzes', {
        description: error.message,
      });
    }
  };

  useEffect(() => {
    fetchAssignments();
    fetchStudents();
    fetchLessonsAndQuizzes();
  }, []);

  return (
    <TeacherLayout>
      <div>
        <h1 className="text-3xl font-bold mb-6">Student Assignments</h1>
        
        <Tabs defaultValue="create" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="create">Create Assignment</TabsTrigger>
            <TabsTrigger value="view">View Assignments</TabsTrigger>
          </TabsList>
          
          <TabsContent value="create" className="space-y-4">
            <div className="bg-card rounded-lg p-6 shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Assign Lesson or Quiz</h2>
              <AssignmentForm 
                students={students}
                lessons={lessons}
                quizzes={quizzes}
                onSuccess={fetchAssignments} 
              />
            </div>
          </TabsContent>
          
          <TabsContent value="view">
            <AssignmentsList 
              assignments={assignments} 
              loading={loading} 
              onUpdate={fetchAssignments} 
            />
          </TabsContent>
        </Tabs>
      </div>
    </TeacherLayout>
  );
};

export default Assignments;
