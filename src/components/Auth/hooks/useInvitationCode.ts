import { useState, useEffect, useRef } from 'react';
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
  const previousCodeRef = useRef<string>('');
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const validateInvitationCode = async (code: string) => {
    if (!code || code.length !== 8) return false;
    
    // Skip validation if code hasn't changed
    if (previousCodeRef.current === code) return invitationStatus?.valid || false;
    
    // Update ref to prevent duplicate validations
    previousCodeRef.current = code;
    
    setIsCheckingCode(true);
    setInvitationStatus(null);
    
    try {
      console.log("Validando código de convite:", code);
      
      // Use the database function to validate the invitation code
      const { data, error } = await supabase.rpc(
        'validate_invitation_code',
        { code: code.toUpperCase() }
      );
      
      console.log("Resultado da validação:", data, error);
      
      if (error) {
        console.error("Erro na função do Supabase:", error);
        setInvitationStatus({ 
          valid: false, 
          message: 'Erro ao validar código: ' + error.message 
        });
        return false;
      }
      
      // Check if we got a result and if the invitation is valid
      if (!data || data.length === 0 || !data[0].is_valid) {
        const message = data && data[0] ? data[0].message : 'Código de convite inválido';
        console.log("Convite inválido:", message);
        setInvitationStatus({ 
          valid: false, 
          message: message
        });
        return false;
      }
      
      // Extract the validation result
      const validationResult = data[0];
      
      // Para convites baseados em código, pode não haver um email
      if (validationResult.student_email && validationResult.student_email.trim() !== '') {
        form.setValue('email', validationResult.student_email, { 
          shouldValidate: true,
          shouldDirty: true
        });
      }
      
      // Obter o nome do professor formatado
      const teacherName = validationResult.teacher_name || 'seu professor';
      
      console.log("Convite válido de:", teacherName);
      setInvitationStatus({ 
        valid: true, 
        message: `Convite válido de ${teacherName}`, 
        teacherName 
      });
      
      return true;
    } catch (error) {
      console.error('Erro ao validar código de convite:', error);
      setInvitationStatus({ 
        valid: false, 
        message: 'Erro ao validar código' 
      });
      return false;
    } finally {
      setIsCheckingCode(false);
    }
  };

  const handleInvitationCodeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const code = event.target.value.toUpperCase();
    
    // Update form value without triggering validation
    form.setValue('invitationCode', code, { 
      shouldValidate: false,
      shouldDirty: true
    });
    
    // Clear previous timeout if it exists
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Only validate complete codes or clear status for incomplete ones
    if (code.length === 8) {
      // Debounce validation to prevent excessive API calls
      timeoutRef.current = setTimeout(() => {
        validateInvitationCode(code);
      }, 300);
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
