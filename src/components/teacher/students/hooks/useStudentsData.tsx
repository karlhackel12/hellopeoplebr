
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
          .select('id, user_id, email, status, invitation_code, used_by_name, accepted_at')
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
          
        // Log for debugging
        console.log(`Encontrados ${acceptedInvitations.length} convites aceitos`);
        
        // Get all students (role = 'student') profiles regardless of invitation status
        // This will help us match by email later
        const { data: allStudentProfiles, error: allProfilesError } = await supabase
          .from('profiles')
          .select(`
            id,
            first_name,
            last_name,
            avatar_url,
            created_at,
            email
          `)
          .eq('role', 'student');
          
        if (allProfilesError) {
          console.error('Erro ao buscar todos os perfis de alunos:', allProfilesError);
          throw allProfilesError;
        }
        
        // Type guard to ensure allStudentProfiles is an array
        const validProfiles = Array.isArray(allStudentProfiles) ? allStudentProfiles : [];
        
        console.log(`Encontrados ${validProfiles.length || 0} perfis de alunos no sistema`);
        
        // Array to hold all student profiles (both real and virtual)
        let enrichedProfiles = [];
        
        // Process accepted invitations to find matching profiles either by user_id or email
        if (acceptedInvitations.length > 0) {
          // For each accepted invitation, try to find a matching profile
          const processedProfiles = acceptedInvitations.map(invitation => {
            // First try to match by user_id
            let matchingProfile = validProfiles.find(profile => 
              profile.id === invitation.user_id
            );
            
            // If no match by user_id, try to match by email
            if (!matchingProfile && invitation.email) {
              matchingProfile = validProfiles.find(profile => 
                profile.email?.toLowerCase() === invitation.email?.toLowerCase()
              );
            }
            
            if (matchingProfile) {
              // We found a matching real profile (either by id or email)
              console.log(`Perfil encontrado para convite: ${invitation.email || invitation.id}`);
              return {
                id: matchingProfile.id,
                first_name: matchingProfile.first_name,
                last_name: matchingProfile.last_name,
                avatar_url: matchingProfile.avatar_url,
                email: matchingProfile.email,
                created_at: matchingProfile.created_at,
                invitation_code: invitation.invitation_code,
                invitation_email: invitation.email,
                invitation_status: invitation.status,
                is_virtual: false
              };
            } else {
              // No matching profile found, create a virtual one
              console.log(`Nenhum perfil encontrado para convite: ${invitation.email || invitation.id}`);
              return {
                id: invitation.id, // Use invitation ID as profile ID
                first_name: invitation.used_by_name ? invitation.used_by_name.split(' ')[0] : 'Aluno',
                last_name: invitation.used_by_name && invitation.used_by_name.split(' ').length > 1 
                  ? invitation.used_by_name.split(' ').slice(1).join(' ') 
                  : 'Convidado',
                email: invitation.email,
                created_at: invitation.accepted_at || new Date().toISOString(),
                avatar_url: null,
                invitation_code: invitation.invitation_code,
                invitation_email: invitation.email,
                invitation_status: invitation.status,
                is_virtual: true // Flag to indicate this is a virtual profile
              };
            }
          });
          
          enrichedProfiles = processedProfiles;
        }
        
        if (enrichedProfiles.length === 0) {
          console.log('Nenhum aluno ativo encontrado.');
        } else {
          console.log(`Total de ${enrichedProfiles.length} alunos encontrados (reais + virtuais)`);
          
          // Log how many are virtual vs real
          const virtualCount = enrichedProfiles.filter(p => p.is_virtual).length;
          const realCount = enrichedProfiles.length - virtualCount;
          console.log(`${realCount} alunos com contas reais, ${virtualCount} alunos com contas virtuais`);
        }
        
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
