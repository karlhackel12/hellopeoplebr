
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

export const useInvitationManagement = (onUpdate: () => void) => {
  const [processingInvitations, setProcessingInvitations] = useState<Record<string, boolean>>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const queryClient = useQueryClient();

  const handleInvitationUpdate = async (id: string, action: 'delete' | 'resend', email: string, invitationCode?: string) => {
    try {
      setProcessingInvitations(prev => ({ ...prev, [id]: true }));
      setIsProcessing(true);

      if (action === 'delete') {
        const { error } = await supabase
          .from('student_invitations')
          .delete()
          .eq('id', id);

        if (error) throw error;
        
        toast.success('Invitation deleted', {
          description: `The invitation to ${email} has been removed.`,
        });
      } else if (action === 'resend' && invitationCode) {
        // Update expiration and status
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);
        
        const { error: updateError } = await supabase
          .from('student_invitations')
          .update({
            expires_at: expiresAt.toISOString(),
            status: 'pending',
          })
          .eq('id', id);
        
        if (updateError) throw updateError;

        // Get teacher's profile data
        const { data: { user } } = await supabase.auth.getUser();
        const { data: profileData } = await supabase
          .from('profiles')
          .select('first_name, last_name')
          .eq('id', user?.id)
          .single();

        const teacherName = profileData
          ? `${profileData.first_name || ''} ${profileData.last_name || ''}`.trim()
          : 'Your teacher';

        // Resend invitation email
        const { error: emailError } = await supabase.functions.invoke('send-invitation-email', {
          body: { email, invitation_code: invitationCode, teacher_name: teacherName }
        });

        if (emailError) {
          console.error('Error sending invitation email:', emailError);
          toast.warning('Invitation updated but email delivery failed', {
            description: 'The invitation was updated but we could not send the email.',
          });
        } else {
          toast.success('Invitation resent', {
            description: `The invitation has been resent to ${email}`,
          });
        }
      }

      // Force data refresh
      queryClient.invalidateQueries({ queryKey: ['student-invitations'] });
      onUpdate();
      
    } catch (error: any) {
      console.error(`Error ${action}ing invitation:`, error);
      toast.error(`Failed to ${action} invitation`, {
        description: error.message,
      });
    } finally {
      setProcessingInvitations(prev => ({ ...prev, [id]: false }));
      setIsProcessing(false);
    }
  };

  return {
    processingInvitations,
    isProcessing,
    deleteInvitation: (id: string, email: string) => 
      handleInvitationUpdate(id, 'delete', email),
    resendInvitation: (id: string, email: string, invitationCode: string) => 
      handleInvitationUpdate(id, 'resend', email, invitationCode)
  };
};
