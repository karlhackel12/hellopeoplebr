
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

        return data || [];
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
