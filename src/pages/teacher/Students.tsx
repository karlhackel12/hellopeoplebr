
import React, { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'react-router-dom';
import TeacherLayout from '@/components/layout/TeacherLayout';
import StudentsTabs from '@/components/teacher/students/StudentsTabs';
import StudentsError from '@/components/teacher/students/StudentsError';
import { useStudentsData } from '@/components/teacher/students/hooks/useStudentsData';
import { useOnboardingData } from '@/components/teacher/students/hooks/useOnboardingData';
import { useInvitationsData } from '@/components/teacher/students/hooks/useInvitationsData';
import { useIsMobile } from '@/hooks/use-mobile';

const Students = () => {
  const location = useLocation();
  const initialTab = location.state?.initialTab || 'students';
  const [activeTab, setActiveTab] = useState(initialTab);
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();
  
  // Set initial tab from location state if provided
  useEffect(() => {
    if (location.state?.initialTab) {
      setActiveTab(location.state.initialTab);
    }
  }, [location.state]);
  
  // Use our custom hooks to fetch data
  const { students, loadingStudents, studentsError, refetchStudents } = useStudentsData();
  const { studentsWithOnboarding, loadingOnboarding } = useOnboardingData(students);
  const { 
    invitations, 
    loadingInvitations, 
    isRefetchingInvitations,
    handleInvitationUpdate,
    refetchInvitations
  } = useInvitationsData(queryClient);

  // Show error state if student query failed
  if (studentsError) {
    return <StudentsError />;
  }

  return (
    <TeacherLayout pageTitle="Gerenciamento de Alunos">
      <div className="animate-fade-in">
        {!isMobile && <h1 className="text-3xl font-bold mb-6">Gerenciamento de Alunos</h1>}
        
        <StudentsTabs 
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          studentsWithOnboarding={studentsWithOnboarding}
          loadingStudents={loadingStudents}
          loadingOnboarding={loadingOnboarding}
          refetchStudents={refetchStudents}
          invitations={invitations}
          loadingInvitations={loadingInvitations}
          isRefetchingInvitations={isRefetchingInvitations}
          handleInvitationUpdate={handleInvitationUpdate}
        />
      </div>
    </TeacherLayout>
  );
};

export default Students;
