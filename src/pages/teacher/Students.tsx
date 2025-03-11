
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import TeacherLayout from '@/components/layout/TeacherLayout';
import { supabase } from '@/integrations/supabase/client';
import StudentsList from '@/components/teacher/students/StudentsList';
import StudentInviteForm from '@/components/teacher/StudentInviteForm';
import InvitationsList from '@/components/teacher/InvitationsList';
import { toast } from 'sonner';

const Students = () => {
  const [activeTab, setActiveTab] = useState('students');
  
  // Fetch student data using React Query
  const { 
    data: students = [], 
    isLoading: loadingStudents,
    refetch: refetchStudents
  } = useQuery({
    queryKey: ['students-list'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          first_name,
          last_name,
          avatar_url,
          created_at,
          user_onboarding (
            current_step_index,
            completed_steps
          )
        `)
        .eq('role', 'student');

      if (error) {
        toast.error('Failed to load students', {
          description: error.message
        });
        throw error;
      }

      return data || [];
    }
  });

  // Fetch invitation data
  const { 
    data: invitations = [], 
    isLoading: loadingInvitations,
    refetch: refetchInvitations
  } = useQuery({
    queryKey: ['student-invitations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('student_invitations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        toast.error('Failed to load invitations', {
          description: error.message
        });
        throw error;
      }

      return data || [];
    }
  });

  // Handler for successful invitation
  const handleInvitationSuccess = () => {
    refetchInvitations();
  };

  return (
    <TeacherLayout>
      <div className="animate-fade-in">
        <h1 className="text-3xl font-bold mb-6">Student Management</h1>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="students">Students</TabsTrigger>
            <TabsTrigger value="invite">Invite Students</TabsTrigger>
            <TabsTrigger value="invitations">Pending Invitations</TabsTrigger>
          </TabsList>
          
          <TabsContent value="students">
            <StudentsList 
              students={students} 
              loading={loadingStudents} 
              onUpdate={refetchStudents} 
            />
          </TabsContent>
          
          <TabsContent value="invite" className="space-y-4">
            <div className="bg-card rounded-lg p-6 shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Invite a New Student</h2>
              <StudentInviteForm onSuccess={handleInvitationSuccess} />
            </div>
          </TabsContent>
          
          <TabsContent value="invitations">
            <InvitationsList 
              invitations={invitations} 
              loading={loadingInvitations} 
              onUpdate={refetchInvitations} 
            />
          </TabsContent>
        </Tabs>
      </div>
    </TeacherLayout>
  );
};

export default Students;
