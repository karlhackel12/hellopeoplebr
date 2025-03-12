
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import StudentsList from '@/components/teacher/students/StudentsList';
import StudentInviteForm from '@/components/teacher/StudentInviteForm';
import InvitationsList from '@/components/teacher/InvitationsList';

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
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="mb-6">
        <TabsTrigger value="students">Students</TabsTrigger>
        <TabsTrigger value="invite">Invite Students</TabsTrigger>
        <TabsTrigger value="invitations">Pending Invitations</TabsTrigger>
      </TabsList>
      
      <TabsContent value="students">
        <StudentsList 
          students={studentsWithOnboarding} 
          loading={loadingStudents || loadingOnboarding} 
          onUpdate={refetchStudents} 
        />
      </TabsContent>
      
      <TabsContent value="invite" className="space-y-4">
        <div className="bg-card rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Invite a New Student</h2>
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
