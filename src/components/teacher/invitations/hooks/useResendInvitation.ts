
import { useCallback } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useInvitationAction } from './useInvitationAction';

export const useResendInvitation = (onUpdate: () => void) => {
  const { 
    processingInvitations: resendingInvitations, 
    isProcessing: isResending,
    startProcessing,
    stopProcessing,
    handleError
  } = useInvitationAction(onUpdate);

  const resendInvitation = useCallback(async (id: string, email: string, invitationCode: string) => {
    try {
      // Mark this invitation as being processed
      startProcessing(id);

      console.log(`Resending invitation to ${email} with code ${invitationCode}`);

      // Update the expiration date (7 days from now)
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);
      
      const { error } = await supabase
        .from('student_invitations')
        .update({
          expires_at: expiresAt.toISOString(),
          status: 'pending',
        })
        .eq('id', id);
      
      if (error) {
        console.error('Error updating invitation:', error);
        throw error;
      }
      
      console.log('Invitation updated successfully with new expiration date:', expiresAt.toISOString());
      
      // Get user profile to get the teacher's name
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        toast.error('Authentication error', {
          description: 'You must be logged in to resend invitations',
        });
        return;
      }

      // Get teacher's profile data
      const { data: profileData } = await supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('id', userData.user.id)
        .single();

      // Format teacher name for the email
      const teacherName = profileData
        ? `${profileData.first_name || ''} ${profileData.last_name || ''}`.trim()
        : 'Your teacher';

      console.log('Teacher name for invitation email:', teacherName);

      // Send the invitation email using our edge function
      const { error: emailError } = await supabase.functions.invoke('send-invitation-email', {
        body: {
          email: email,
          invitation_code: invitationCode,
          teacher_name: teacherName
        }
      });
      
      if (emailError) {
        console.error('Error sending invitation email:', emailError);
        toast.warning('Invitation updated but email delivery failed', {
          description: 'The invitation was updated but we could not send the email. The student can still use the invitation code.',
        });
      } else {
        console.log('Invitation email sent successfully');
        toast.success('Invitation resent', {
          description: `The invitation to ${email} has been resent with code ${invitationCode}`,
        });
      }
    } catch (error: any) {
      handleError(error, 'resend invitation');
    } finally {
      // Clear the processing state
      stopProcessing(id);
    }
  }, [startProcessing, stopProcessing, handleError]);

  return {
    resendingInvitations,
    resendInvitation,
    isResending
  };
};
