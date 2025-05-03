import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useEffect, useCallback } from 'react';

export const useStudentsData = () => {
  // Fetch student profile data using React Query
  const { 
    data: students = [], 
    isLoading: loadingStudents,
    error: studentsError,
    refetch: refetchStudents,
    isRefetching: isRefetchingStudents
  } = useQuery({
    queryKey: ['students-profiles'],
    queryFn: async () => {
      try {
        // First check if user is authenticated
        const { data: authData, error: authError } = await supabase.auth.getUser();
        if (authError || !authData.user) {
          console.error('Erro de autenticação:', authError);
          throw new Error('É necessário autenticação para acessar os dados');
        }

        // Get the current teacher's ID
        const teacherId = authData.user.id;

        console.log('Buscando dados de alunos ativos para o professor:', teacherId);

        // Get students who were invited by this teacher
        const { data: invitedStudents, error: invitationsError } = await supabase
          .from('student_invitations')
          .select('id, user_id, email, status, invitation_code')
          .eq('invited_by', teacherId);

        if (invitationsError) {
          console.error('Erro ao buscar convites de alunos:', invitationsError);
          if (invitationsError.code === 'PGRST301') {
            toast.error('Permissão negada', {
              description: 'Você não tem permissão para visualizar convites de alunos'
            });
          }
          throw invitationsError;
        }

        console.log('Convites encontrados:', invitedStudents?.length || 0);
        if (invitedStudents && invitedStudents.length > 0) {
          console.log('Detalhes dos convites:', invitedStudents.map(inv => ({
            code: inv.invitation_code,
            email: inv.email,
            status: inv.status,
            user_id: inv.user_id
          })));
        }

        // Extract the user_ids from invitations where students have accepted
        const acceptedInvitations = invitedStudents
          ?.filter(invitation => invitation.status === 'accepted') || [];
          
        const studentUserIds = acceptedInvitations
          .filter(invitation => invitation.user_id)
          .map(invitation => invitation.user_id as string);

        // Log for debugging
        console.log(`Encontrados ${acceptedInvitations.length} convites aceitos`);
        console.log(`Destes, ${studentUserIds.length} têm IDs de usuários válidos`);
        
        if (studentUserIds.length > 0) {
          console.log('IDs dos alunos aceitos:', studentUserIds);
        }

        // If there are no invited students, return empty array
        if (studentUserIds.length === 0) {
          console.log('Nenhum aluno ativo encontrado.');
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
            created_at,
            email,
            phone
          `)
          .eq('role', 'student')
          .in('id', studentUserIds);

        if (error) {
          console.error('Erro ao buscar perfis dos alunos:', error);
          if (error.code === 'PGRST301') {
            toast.error('Permissão negada', {
              description: 'Você não tem permissão para visualizar dados dos alunos'
            });
          } else {
            toast.error('Falha ao carregar alunos', {
              description: error.message
            });
          }
          throw error;
        }

        console.log(`Encontrados ${studentProfiles?.length || 0} perfis de alunos dos convites aceitos`);
        
        if (studentProfiles && studentProfiles.length > 0) {
          console.log('Perfis encontrados:', studentProfiles.map(profile => ({
            id: profile.id,
            name: `${profile.first_name} ${profile.last_name}`,
            email: profile.email
          })));
        }
        
        // Enriquecer os perfis dos alunos com dados dos convites
        const enrichedProfiles = studentProfiles?.map(profile => {
          const invitation = acceptedInvitations.find(inv => inv.user_id === profile.id);
          return {
            ...profile,
            invitation_code: invitation?.invitation_code,
            invitation_email: invitation?.email,
            invitation_status: invitation?.status
          };
        }) || [];
        
        return enrichedProfiles;
      } catch (error: any) {
        console.error('Falha ao buscar alunos:', error);
        
        if (error.message.includes('autenticação') || error.message.includes('authentication')) {
          toast.error('Erro de autenticação', {
            description: 'Por favor, faça login novamente para continuar'
          });
        } else {
          toast.error('Erro ao carregar alunos', {
            description: error.message || 'Ocorreu um erro inesperado'
          });
        }
        
        return [];
      }
    },
    staleTime: 0, // Always consider data stale
    refetchOnWindowFocus: true, // Refetch on window focus
    refetchInterval: 15000 // Refetch every 15 seconds
  });

  // Função para forçar atualização dos dados
  const forceRefresh = useCallback(() => {
    console.log('Forçando atualização dos dados de alunos...');
    refetchStudents();
    
    // Programar uma segunda atualização para garantir que os dados estejam consistentes
    setTimeout(() => {
      console.log('Executando atualização secundária dos dados de alunos...');
      refetchStudents();
    }, 2000);
  }, [refetchStudents]);

  // Configurar um listener para mudanças nas tabelas relevantes
  useEffect(() => {
    // Listener para a tabela de convites
    const invitationsSubscription = supabase
      .channel('invitations_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'student_invitations'
      }, (payload) => {
        console.log('Mudança detectada na tabela de convites:', payload);
        forceRefresh();
      })
      .subscribe();

    // Listener para a tabela de perfis
    const profilesSubscription = supabase
      .channel('profiles_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'profiles',
        filter: 'role=eq.student'
      }, (payload) => {
        console.log('Mudança detectada na tabela de perfis (alunos):', payload);
        forceRefresh();
      })
      .subscribe();

    return () => {
      invitationsSubscription.unsubscribe();
      profilesSubscription.unsubscribe();
    };
  }, [forceRefresh]);

  return {
    students,
    loadingStudents,
    studentsError,
    isRefetchingStudents,
    refetchStudents,
    forceRefresh
  };
};
