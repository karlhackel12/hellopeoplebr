
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import StudentsList from '@/components/teacher/students/StudentsList';
import StudentInviteForm from '@/components/teacher/StudentInviteForm';
import InvitationsList from '@/components/teacher/InvitationsList';
import { useIsMobile } from '@/hooks/use-mobile';

interface StudentsTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  studentsWithOnboarding: any[];
  loadingStudents: boolean;
  loadingOnboarding: boolean;
  refetchStudents: () => void;
  invitations: any[];
  loadingInvitations: boolean;
  isRefetchingInvitations: boolean;
  handleInvitationUpdate: () => void;
}

const StudentsTabs: React.FC<StudentsTabsProps> = ({
  activeTab,
  setActiveTab,
  studentsWithOnboarding,
  loadingStudents,
  loadingOnboarding,
  refetchStudents,
  invitations,
  loadingInvitations,
  isRefetchingInvitations,
  handleInvitationUpdate
}) => {
  const isMobile = useIsMobile();
  
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className={`mb-6 ${isMobile ? 'w-full' : ''}`}>
        <TabsTrigger value="students" className={isMobile ? 'flex-1' : ''}>Alunos</TabsTrigger>
        <TabsTrigger value="invite" className={isMobile ? 'flex-1' : ''}>Convidar</TabsTrigger>
        <TabsTrigger value="invitations" className={isMobile ? 'flex-1' : ''}>Pendentes</TabsTrigger>
      </TabsList>
      
      <TabsContent value="students">
        <StudentsList 
          students={studentsWithOnboarding} 
          loading={loadingStudents || loadingOnboarding} 
          onUpdate={refetchStudents} 
        />
      </TabsContent>
      
      <TabsContent value="invite" className="space-y-4">
        <div className="bg-card rounded-lg p-4 sm:p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Convidar um Novo Aluno</h2>
          <StudentInviteForm onSuccess={handleInvitationUpdate} />
        </div>
      </TabsContent>
      
      <TabsContent value="invitations">
        <InvitationsList 
          invitations={invitations} 
          loading={loadingInvitations || isRefetchingInvitations} 
          onUpdate={handleInvitationUpdate} 
        />
      </TabsContent>
    </Tabs>
  );
};

export default StudentsTabs;
