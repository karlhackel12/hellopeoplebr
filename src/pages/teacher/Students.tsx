
import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import TeacherLayout from '@/components/layout/TeacherLayout';
import StudentsTabs from '@/components/teacher/students/StudentsTabs';
import StudentsError from '@/components/teacher/students/StudentsError';
import { useStudentsData } from '@/components/teacher/students/hooks/useStudentsData';
import { useOnboardingData } from '@/components/teacher/students/hooks/useOnboardingData';
import { useInvitationsData } from '@/components/teacher/students/hooks/useInvitationsData';

const Students = () => {
  const [activeTab, setActiveTab] = useState('students');
  const queryClient = useQueryClient();
  
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
    <TeacherLayout>
      <div className="animate-fade-in">
        <h1 className="text-3xl font-bold mb-6">Student Management</h1>
        
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
