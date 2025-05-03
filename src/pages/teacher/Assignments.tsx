import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import TeacherLayout from '@/components/layout/TeacherLayout';
import AssignmentForm from '@/components/teacher/AssignmentForm';
import AssignmentsList from '@/components/teacher/AssignmentsList';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { useIsMobile } from '@/hooks/use-mobile';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus } from 'lucide-react';

const Assignments = () => {
  const location = useLocation();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const initialStudentId = location.state?.studentId;
  const studentName = location.state?.studentName;
  const initialTab = location.state?.initialTab;
  const isMobile = useIsMobile();

  // Se vier de uma navegação para criar tarefa, abra o diálogo automaticamente
  useEffect(() => {
    if (initialTab === 'create') {
      setIsFormOpen(true);
    }
  }, [initialTab]);

  // Fetch assignments with React Query - improved query to get all related data
  const { 
    data: assignments = [], 
    isLoading: loadingAssignments,
    refetch: refetchAssignments
  } = useQuery({
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
          lesson_id,
          quiz_id,
          due_date,
          started_at,
          completed_at,
          created_at,
          updated_at,
          status,
          student:student_id(id, first_name, last_name, avatar_url),
          lesson:lesson_id(id, title),
          quiz:quiz_id(id, title)
        `)
        .eq('assigned_by', user.user.id);
      
      // Add student filter if provided
      if (initialStudentId) {
        query = query.eq('student_id', initialStudentId);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar tarefas:', error);
        toast.error('Erro ao carregar tarefas', {
          description: error.message
        });
        return [];
      }
      
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

      if (error) {
        console.error('Erro ao buscar alunos:', error);
        toast.error('Erro ao carregar alunos');
        return [];
      }
      
      return data || [];
    }
  });

  // Improved lesson and quiz fetching - separate queries for better performance
  const { 
    data: lessons = [],
    isLoading: loadingLessons
  } = useQuery({
    queryKey: ['assignable-lessons'],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return [];

      const { data, error } = await supabase
        .from('lessons')
        .select('id, title, is_published')
        .eq('created_by', user.user.id)
        .order('title');

      if (error) {
        console.error('Erro ao buscar lições:', error);
        return [];
      }
      
      return data || [];
    }
  });

  const { 
    data: quizzes = [],
    isLoading: loadingQuizzes
  } = useQuery({
    queryKey: ['assignable-quizzes'],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return [];

      const { data, error } = await supabase
        .from('quizzes')
        .select('id, title, is_published, lesson_id')
        .eq('created_by', user.user.id)
        .order('title');

      if (error) {
        console.error('Erro ao buscar quizzes:', error);
        return [];
      }
      
      return data || [];
    }
  });

  // Handle successful assignment creation
  const handleAssignmentSuccess = () => {
    refetchAssignments();
    setIsFormOpen(false);
    toast.success('Tarefa criada com sucesso!');
  };

  const isLoading = loadingStudents || loadingLessons || loadingQuizzes;

  return (
    <TeacherLayout pageTitle="Tarefas">
      <div className="animate-fade-in">
        <div className="flex justify-between items-center mb-6">
          <h1 className={`${isMobile ? 'text-xl' : 'text-3xl'} font-bold`}>
            {studentName ? `Tarefas para ${studentName}` : 'Tarefas dos Alunos'}
          </h1>
          
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
              <Button className={`${isMobile ? 'px-3' : ''}`}>
                <Plus className="h-4 w-4 mr-2" />
                {isMobile ? 'Nova' : 'Nova Tarefa'}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px]">
              <DialogHeader>
                <DialogTitle>Atribuir Conteúdo ao Aluno</DialogTitle>
              </DialogHeader>
              <AssignmentForm 
                students={students}
                lessons={lessons}
                quizzes={quizzes}
                onSuccess={handleAssignmentSuccess}
                initialStudentId={initialStudentId}
                isLoading={isLoading}
              />
            </DialogContent>
          </Dialog>
        </div>
        
        <AssignmentsList 
          assignments={assignments} 
          loading={loadingAssignments} 
          onUpdate={refetchAssignments} 
        />
      </div>
    </TeacherLayout>
  );
};

export default Assignments;
