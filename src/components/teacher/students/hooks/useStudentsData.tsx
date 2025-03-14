
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useStudentsData = () => {
  // Fetch student profile data using React Query
  const { 
    data: students = [], 
    isLoading: loadingStudents,
    error: studentsError,
    refetch: refetchStudents
  } = useQuery({
    queryKey: ['students-profiles'],
    queryFn: async () => {
      try {
        // First check if user is authenticated
        const { data: authData, error: authError } = await supabase.auth.getUser();
        if (authError || !authData.user) {
          throw new Error('Authentication required');
        }

        // Get the current teacher's ID
        const teacherId = authData.user.id;

        // Get students who were invited by this teacher
        const { data: invitedStudents, error: invitationsError } = await supabase
          .from('student_invitations')
          .select('user_id, email')
          .eq('invited_by', teacherId)
          .eq('status', 'accepted')
          .not('user_id', 'is', null);

        if (invitationsError) {
          console.error('Error fetching student invitations:', invitationsError);
          throw invitationsError;
        }

        // Extract the user_ids from invitations
        const studentUserIds = invitedStudents
          ?.filter(invitation => invitation.user_id)
          .map(invitation => invitation.user_id) || [];

        // If there are no invited students, return empty array
        if (studentUserIds.length === 0) {
          return [];
        }

        // Fetch student profiles based on the user_ids from invitations
        const { data: studentProfiles, error } = await supabase
          .from('profiles')
          .select(`
            id,
            first_name,
            last_name,
            avatar_url,
            created_at
          `)
          .eq('role', 'student')
          .in('id', studentUserIds);

        if (error) {
          console.error('Error fetching students:', error);
          if (error.code === 'PGRST301') {
            toast.error('Permission denied', {
              description: 'You do not have permission to view student data'
            });
          } else {
            toast.error('Failed to load students', {
              description: error.message
            });
          }
          throw error;
        }

        console.log(`Found ${studentProfiles?.length || 0} students invited by this teacher`);
        return studentProfiles || [];
      } catch (error: any) {
        console.error('Failed to fetch students:', error);
        toast.error('Authentication error', {
          description: 'Please sign in again to continue'
        });
        throw error;
      }
    }
  });

  return {
    students,
    loadingStudents,
    studentsError,
    refetchStudents
  };
};
