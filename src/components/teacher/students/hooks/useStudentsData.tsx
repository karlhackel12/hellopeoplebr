
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useEffect, useCallback } from 'react';

type StudentProfile = {
  id: string;
  first_name: string;
  last_name: string;
  avatar_url?: string | null;
  email?: string | null;
  created_at?: string;
  invitation_code?: string;
  invitation_email?: string;
  invitation_status?: string;
  is_virtual: boolean;
};

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
          console.error('Authentication error:', authError);
          throw new Error('Authentication required to access data');
        }

        // Get the current teacher's ID
        const teacherId = authData.user.id;

        console.log('Fetching active student data for teacher:', teacherId);

        // Get students who were invited by this teacher
        const { data: invitedStudents, error: invitationsError } = await supabase
          .from('student_invitations')
          .select('id, user_id, email, status, invitation_code, used_by_name, accepted_at')
          .eq('invited_by', teacherId);

        if (invitationsError) {
          console.error('Error fetching student invitations:', invitationsError);
          if (invitationsError.code === 'PGRST301') {
            toast.error('Permission denied', {
              description: 'You do not have permission to view student invitations'
            });
          }
          throw invitationsError;
        }

        console.log('Invitations found:', invitedStudents?.length || 0);
        if (invitedStudents && invitedStudents.length > 0) {
          console.log('Invitation details:', invitedStudents.map(inv => ({
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
        console.log(`Found ${acceptedInvitations.length} accepted invitations`);
        
        // Get all students (role = 'student') profiles regardless of invitation status
        // This will help us match by email later
        const { data: profilesData, error: allProfilesError } = await supabase
          .from('profiles')
          .select(`
            id,
            first_name,
            last_name,
            avatar_url,
            created_at
          `)
          .eq('role', 'student');
          
        if (allProfilesError) {
          console.error('Error fetching student profiles:', allProfilesError);
          throw allProfilesError;
        }
        
        const allStudentProfiles = profilesData || [];
        
        // Get emails from the users table
        const { data: usersData, error: usersError } = await supabase
          .from('users')
          .select('id, email');
          
        if (usersError) {
          console.error('Error fetching user emails:', usersError);
        }
        
        // Create a map of user IDs to emails
        const userEmailMap = new Map();
        if (Array.isArray(usersData)) {
          usersData.forEach(user => {
            if (user.id && user.email) {
              userEmailMap.set(user.id, user.email);
            }
          });
        }
        
        // Enrich profiles with emails from users table
        const enrichedProfiles = allStudentProfiles.map(profile => ({
          ...profile,
          email: userEmailMap.get(profile.id) || null
        }));
        
        console.log(`Found ${allStudentProfiles.length || 0} student profiles in the system`);
        
        // Array to hold all student profiles (both real and virtual)
        let finalProfiles: StudentProfile[] = [];
        
        // Process accepted invitations to find matching profiles either by user_id or email
        if (acceptedInvitations.length > 0) {
          // For each accepted invitation, try to find a matching profile
          const processedProfiles = acceptedInvitations.map(invitation => {
            // First try to match by user_id
            let matchingProfile = enrichedProfiles.find(profile => 
              profile.id === invitation.user_id
            );
            
            // If no match by user_id, try to match by email
            if (!matchingProfile && invitation.email) {
              matchingProfile = enrichedProfiles.find(profile => 
                profile.email?.toLowerCase() === invitation.email?.toLowerCase()
              );
            }
            
            if (matchingProfile) {
              // We found a matching real profile (either by id or email)
              console.log(`Profile found for invitation: ${invitation.email || invitation.id}`);
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
              } as StudentProfile;
            } else {
              // No matching profile found, create a virtual one
              console.log(`No profile found for invitation: ${invitation.email || invitation.id}`);
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
              } as StudentProfile;
            }
          });
          
          finalProfiles = processedProfiles;
        }
        
        if (finalProfiles.length === 0) {
          console.log('No active students found.');
        } else {
          console.log(`Total of ${finalProfiles.length} students found (real + virtual)`);
          
          // Log how many are virtual vs real
          const virtualCount = finalProfiles.filter(p => p.is_virtual).length;
          const realCount = finalProfiles.length - virtualCount;
          console.log(`${realCount} students with real accounts, ${virtualCount} students with virtual accounts`);
        }
        
        return finalProfiles;
      } catch (error: any) {
        console.error('Failed to fetch students:', error);
        
        if (error.message.includes('authentication') || error.message.includes('Authentication')) {
          toast.error('Authentication error', {
            description: 'Please log in again to continue'
          });
        } else {
          toast.error('Error loading students', {
            description: error.message || 'An unexpected error occurred'
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
    refetchStudents
  };
};
