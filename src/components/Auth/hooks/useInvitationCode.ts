
import { useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { RegisterFormValues } from '../types';
import { supabase } from '@/integrations/supabase/client';

type InvitationStatus = {
  valid: boolean;
  message: string;
  teacherName?: string;
};

export const useInvitationCode = (form: UseFormReturn<any>) => {
  const [invitationStatus, setInvitationStatus] = useState<InvitationStatus | null>(null);
  const [isCheckingCode, setIsCheckingCode] = useState(false);

  const validateInvitationCode = async (code: string) => {
    if (!code) return false;
    
    setIsCheckingCode(true);
    setInvitationStatus(null);
    
    try {
      console.log("Validating invitation code:", code);
      
      // First, try to get the invitation
      const { data: invitations, error } = await supabase
        .from('student_invitations')
        .select(`
          *,
          invited_by:profiles(first_name, last_name)
        `)
        .eq('invitation_code', code.toUpperCase())
        .eq('status', 'pending');
      
      console.log("Invitation query result:", { invitations, error });
      
      if (error) {
        console.error("Supabase error:", error);
        setInvitationStatus({ 
          valid: false, 
          message: 'Error validating code: ' + error.message 
        });
        return false;
      }
      
      if (!invitations || invitations.length === 0) {
        console.log("No invitation found with this code");
        setInvitationStatus({ 
          valid: false, 
          message: 'Invalid or expired invitation code' 
        });
        return false;
      }
      
      // Use the first invitation if multiple are found
      const invitation = invitations[0];
      
      // Check if the invitation has expired
      const expiresAt = new Date(invitation.expires_at);
      if (expiresAt < new Date()) {
        console.log("Invitation expired on:", expiresAt);
        setInvitationStatus({ 
          valid: false, 
          message: 'This invitation has expired' 
        });
        return false;
      }
      
      const teacherName = invitation.invited_by 
        ? `${invitation.invited_by.first_name || ''} ${invitation.invited_by.last_name || ''}`.trim() 
        : 'your teacher';
      
      form.setValue('email', invitation.email);
      
      console.log("Valid invitation from:", teacherName);
      setInvitationStatus({ 
        valid: true, 
        message: `Valid invitation from ${teacherName}`, 
        teacherName 
      });
      
      return true;
    } catch (error) {
      console.error('Error validating invitation code:', error);
      setInvitationStatus({ 
        valid: false, 
        message: 'Error validating code' 
      });
      return false;
    } finally {
      setIsCheckingCode(false);
    }
  };

  const handleInvitationCodeChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const code = event.target.value;
    
    if (form.getValues() && typeof form.getValues() === 'object') {
      (form.getValues() as RegisterFormValues).invitationCode = code;
    }
    
    if (code.length === 8) {
      await validateInvitationCode(code);
    } else {
      setInvitationStatus(null);
    }
  };

  return {
    invitationStatus,
    isCheckingCode,
    validateInvitationCode,
    handleInvitationCodeChange,
    setInvitationStatus
  };
};
