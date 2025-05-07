
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
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
      console.log('Buscando convites de alunos...');
      
      try {
        // First check if user is authenticated
        const { data: authData, error: authError } = await supabase.auth.getUser();
        if (authError || !authData.user) {
          console.error('Erro de autenticação:', authError);
          throw new Error('É necessário autenticação para acessar os dados');
        }
        
        const teacherId = authData.user.id;
        console.log('Buscando convites para o professor:', teacherId);
        
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
            accepted_at,
            profiles:profiles(first_name, last_name)
          `)
          .eq('invited_by', teacherId)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Erro ao buscar convites:', error);
          if (error.code === 'PGRST301') {
            toast.error('Permissão negada', {
              description: 'Você não tem permissão para visualizar convites'
            });
          } else {
            toast.error('Falha ao carregar convites', {
              description: error.message
            });
          }
          throw error;
        }

        console.log(`Encontrados ${data ? data.length : 0} convites`);
        
        if (data && data.length > 0) {
          // Mostrar status detalhado de cada convite para diagnóstico
          console.log('Status detalhado dos convites:', data.map(inv => ({ 
            code: inv.invitation_code, 
            status: inv.status,
            user_id: inv.user_id,
            used_by: inv.used_by_name,
            accepted_at: inv.accepted_at
          })));
        }
        
        // Transform the data to match the expected format
        const transformedData = data?.map(invitation => ({
          ...invitation,
          invited_by: invitation.profiles || { first_name: '', last_name: '' }
        })) || [];
        
        return transformedData;
      } catch (error: any) {
        console.error('Falha ao buscar convites:', error);
        
        if (error.message.includes('autenticação') || error.message.includes('authentication')) {
          toast.error('Erro de autenticação', {
            description: 'Por favor, faça login novamente para continuar'
          });
        }
        
        return [];
      }
    },
    refetchOnWindowFocus: true, // Auto-refetch when window focus returns
    // Removed refetchInterval as requested
  });

  // Força o refetch dos dados manualmente
  const forceRefresh = useCallback(() => {
    console.log('Forçando atualização manual dos dados de convites...');
    
    // Invalidate caches
    queryClient.invalidateQueries({ queryKey: ['student-invitations'] });
    queryClient.invalidateQueries({ queryKey: ['students-profiles'] });
    
    // Immediate refetch
    refetchInvitations();
  }, [queryClient, refetchInvitations]);

  // Handler for successful invitation or deletion
  const handleInvitationUpdate = useCallback(() => {
    console.log('Atualizando dados de convites e alunos manualmente...');
    forceRefresh();
  }, [forceRefresh]);

  return {
    invitations,
    loadingInvitations,
    isRefetchingInvitations,
    handleInvitationUpdate,
    refetchInvitations,
    forceRefresh
  };
};
