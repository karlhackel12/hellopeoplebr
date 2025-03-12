
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
      
      // Use the database function to validate the invitation code
      const { data, error } = await supabase.rpc(
        'validate_invitation_code',
        { code: code.toUpperCase() }
      );
      
      console.log("Validation result:", data, error);
      
      if (error) {
        console.error("Supabase function error:", error);
        setInvitationStatus({ 
          valid: false, 
          message: 'Error validating code: ' + error.message 
        });
        return false;
      }
      
      // Check if we got a result and if the invitation is valid
      if (!data || data.length === 0 || !data[0].is_valid) {
        const message = data && data[0] ? data[0].message : 'Invalid invitation code';
        console.log("Invalid invitation:", message);
        setInvitationStatus({ 
          valid: false, 
          message: message
        });
        return false;
      }
      
      // Extract the validation result
      const validationResult = data[0];
      
      // For code-based invitations, there might not be an email
      if (validationResult.student_email && validationResult.student_email.trim() !== '') {
        form.setValue('email', validationResult.student_email);
      }
      
      const teacherName = validationResult.teacher_name || 'your teacher';
      
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
    const code = event.target.value.toUpperCase();
    
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
