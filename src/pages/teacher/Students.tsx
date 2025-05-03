import React, { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import TeacherLayout from '@/components/layout/TeacherLayout';
import StudentsTabs from '@/components/teacher/students/StudentsTabs';
import StudentsError from '@/components/teacher/students/StudentsError';
import { useStudentsData } from '@/components/teacher/students/hooks/useStudentsData';
import { useOnboardingData } from '@/components/teacher/students/hooks/useOnboardingData';
import { useInvitationsData } from '@/components/teacher/students/hooks/useInvitationsData';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

const Students = () => {
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();
  
  // Use our custom hooks to fetch data
  const { 
    students, 
    loadingStudents, 
    studentsError, 
    refetchStudents, 
    isRefetchingStudents,
    forceRefresh: forceRefreshStudents 
  } = useStudentsData();
  
  const { studentsWithOnboarding, loadingOnboarding } = useOnboardingData(students);
  
  const { 
    invitations, 
    loadingInvitations, 
    isRefetchingInvitations,
    handleInvitationUpdate,
    forceRefresh: forceRefreshInvitations
  } = useInvitationsData(queryClient);

  // Refresh data on component mount to ensure fresh data
  useEffect(() => {
    console.log('Página de alunos montada - carregando dados recentes...');
    forceRefreshStudents();
    forceRefreshInvitations();
  }, [forceRefreshStudents, forceRefreshInvitations]);

  // Função para atualizar manualmente todos os dados
  const handleManualRefresh = () => {
    console.log('Atualizando manualmente todos os dados de alunos e convites...');
    forceRefreshStudents();
    forceRefreshInvitations();
  };

  // Show error state if student query failed
  if (studentsError) {
    return <StudentsError />;
  }

  const isLoading = loadingStudents || loadingInvitations || loadingOnboarding;
  const isRefreshing = isRefetchingStudents || isRefetchingInvitations;

  return (
    <TeacherLayout pageTitle="Gerenciamento de Alunos">
      <div className="animate-fade-in">
        <div className="flex justify-between items-center mb-6">
          {!isMobile && <h1 className="text-3xl font-bold">Gerenciamento de Alunos</h1>}
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleManualRefresh}
            disabled={isLoading || isRefreshing}
            className="ml-auto"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Atualizando...' : 'Atualizar dados'}
          </Button>
        </div>
        
        <StudentsTabs 
          studentsWithOnboarding={studentsWithOnboarding}
          loadingStudents={loadingStudents || isRefetchingStudents}
          loadingOnboarding={loadingOnboarding}
          refetchStudents={forceRefreshStudents}
          invitations={invitations}
          loadingInvitations={loadingInvitations || isRefetchingInvitations}
          isRefetchingInvitations={isRefetchingInvitations}
          handleInvitationUpdate={handleInvitationUpdate}
        />
      </div>
    </TeacherLayout>
  );
};

export default Students;
