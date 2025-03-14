
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useCallback } from 'react';

export const useInvitationsData = (queryClient: any) => {
  // Fetch invitation data
  const { 
    data: invitations = [], 
    isLoading: loadingInvitations,
    refetch: refetchInvitations,
    isRefetching: isRefetchingInvitations
  } = useQuery({
    queryKey: ['student-invitations'],
    queryFn: async () => {
      console.log('Fetching student invitations');
      
      try {
        // First check if user is authenticated
        const { data: authData, error: authError } = await supabase.auth.getUser();
        if (authError || !authData.user) {
          throw new Error('Authentication required');
        }
        
        const teacherId = authData.user.id;
        
        // Get invitations created by the current teacher
        const { data, error } = await supabase
          .from('student_invitations')
          .select(`
            id,
            email,
            status,
            invitation_code,
            created_at,
            expires_at,
            used_by_name,
            invited_by,
            user_id,
            profiles:profiles(first_name, last_name)
          `)
          .eq('invited_by', teacherId)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching invitations:', error);
          if (error.code === 'PGRST301') {
            toast.error('Permission denied', {
              description: 'You do not have permission to view invitations'
            });
          } else {
            toast.error('Failed to load invitations', {
              description: error.message
            });
          }
          throw error;
        }

        console.log('Fetched invitations:', data ? data.length : 0);
        
        // Transform the data to match the expected format
        const transformedData = data?.map(invitation => ({
          ...invitation,
          invited_by: invitation.profiles || { first_name: '', last_name: '' }
        })) || [];
        
        return transformedData;
      } catch (error: any) {
        console.error('Failed to fetch invitations:', error);
        return [];
      }
    },
    staleTime: 0, // Always consider data stale
    refetchOnWindowFocus: true, // Auto-refetch when window focus returns
    refetchInterval: 30000 // Refetch every 30 seconds
  });

  // Handler for successful invitation or deletion
  const handleInvitationUpdate = useCallback(() => {
    console.log('handleInvitationUpdate called, invalidating cache');
    // Invalidate both invitations and students caches
    queryClient.invalidateQueries({ queryKey: ['student-invitations'] });
    queryClient.invalidateQueries({ queryKey: ['students-profiles'] });
    
    // Force refetch data
    setTimeout(() => {
      refetchInvitations();
    }, 100);
  }, [queryClient, refetchInvitations]);

  return {
    invitations,
    loadingInvitations,
    isRefetchingInvitations,
    handleInvitationUpdate,
    refetchInvitations
  };
};
