
import React, { useState, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import TeacherLayout from '@/components/layout/TeacherLayout';
import { supabase } from '@/integrations/supabase/client';
import StudentsList from '@/components/teacher/students/StudentsList';
import StudentInviteForm from '@/components/teacher/StudentInviteForm';
import InvitationsList from '@/components/teacher/InvitationsList';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const Students = () => {
  const [activeTab, setActiveTab] = useState('students');
  const queryClient = useQueryClient();
  
  // Fetch student profile data using React Query
  const { 
    data: students = [], 
    isLoading: loadingStudents,
    error: studentsError,
    refetch: refetchStudents
  } = useQuery({
    queryKey: ['students-profiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          first_name,
          last_name,
          avatar_url,
          created_at
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

  // Fetch onboarding data separately
  const { 
    data: onboardingData = [],
    isLoading: loadingOnboarding
  } = useQuery({
    queryKey: ['students-onboarding'],
    queryFn: async () => {
      if (students.length === 0) return [];
      
      const studentIds = students.map(student => student.id);
      
      const { data, error } = await supabase
        .from('user_onboarding')
        .select('user_id, current_step_index, completed_steps')
        .in('user_id', studentIds);

      if (error) {
        console.error('Failed to load onboarding data:', error);
        return [];
      }

      return data || [];
    },
    enabled: students.length > 0
  });

  // Combine student profiles with their onboarding data
  const studentsWithOnboarding = React.useMemo(() => {
    return students.map(student => {
      const onboarding = onboardingData.find(
        item => item.user_id === student.id
      );
      
      return {
        ...student,
        user_onboarding: onboarding || null
      };
    });
  }, [students, onboardingData]);

  // Fetch invitation data with better cache control
  const { 
    data: invitations = [], 
    isLoading: loadingInvitations,
    refetch: refetchInvitations,
    isRefetching: isRefetchingInvitations
  } = useQuery({
    queryKey: ['student-invitations'],
    queryFn: async () => {
      console.log('Fetching student invitations');
      const { data, error } = await supabase
        .from('student_invitations')
        .select(`
          *,
          invited_by:profiles(first_name, last_name)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching invitations:', error);
        toast.error('Failed to load invitations', {
          description: error.message
        });
        throw error;
      }

      console.log('Fetched invitations:', data ? data.length : 0);
      return data || [];
    },
    staleTime: 0, // Always consider data stale
    refetchOnWindowFocus: true, // Auto-refetch when window focus returns
    refetchInterval: 30000 // Refetch every 30 seconds
  });

  // Handler for successful invitation or deletion
  const handleInvitationUpdate = useCallback(() => {
    console.log('handleInvitationUpdate called, invalidating cache');
    // Invalidate the cache and force refetch data
    queryClient.invalidateQueries({ queryKey: ['student-invitations'] });
    queryClient.removeQueries({ queryKey: ['student-invitations'] });
    setTimeout(() => {
      refetchInvitations();
    }, 100);
    
    // Switch to the invitations tab if we're not already there
    if (activeTab !== 'invitations') {
      setActiveTab('invitations');
    }
  }, [queryClient, refetchInvitations, activeTab, setActiveTab]);

  // Show error state if student query failed
  if (studentsError) {
    return (
      <TeacherLayout>
        <div className="animate-fade-in">
          <h1 className="text-3xl font-bold mb-6">Student Management</h1>
          <div className="bg-destructive/10 text-destructive rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-2">Failed to load students</h2>
            <p>Please try refreshing the page or contact support if the problem persists.</p>
          </div>
        </div>
      </TeacherLayout>
    );
  }

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
      </div>
    </TeacherLayout>
  );
};

export default Students;
