
import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { invitationSchema, InvitationFormValues } from './types';

export const useInvitationVerification = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [invitationVerified, setInvitationVerified] = useState(false);
  const [teacherEmail, setTeacherEmail] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [teacherName, setTeacherName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [initialVerificationAttempted, setInitialVerificationAttempted] = useState(false);
  
  const navigate = useNavigate();
  const { code } = useParams<{ code?: string }>();
  const [searchParams] = useSearchParams();
  const codeFromQuery = searchParams.get('code');
  const verificationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const form = useForm<InvitationFormValues>({
    resolver: zodResolver(invitationSchema),
    defaultValues: {
      invitationCode: code || codeFromQuery || '',
    },
  });

  // Cleanup any pending timeouts
  useEffect(() => {
    return () => {
      if (verificationTimeoutRef.current) {
        clearTimeout(verificationTimeoutRef.current);
      }
    };
  }, []);

  // Automatically verify code if provided in URL, but only once
  useEffect(() => {
    const initialCode = code || codeFromQuery;
    
    if (!initialVerificationAttempted && initialCode && initialCode.length === 8) {
      console.log('Verifying initial code:', initialCode);
      form.setValue('invitationCode', initialCode);
      setInitialVerificationAttempted(true);
      
      // Slight delay to ensure component is fully mounted
      verificationTimeoutRef.current = setTimeout(() => {
        verifyInvitation(initialCode);
      }, 100);
    }
  }, [code, codeFromQuery, form, initialVerificationAttempted]);

  const verifyInvitation = async (invitationCode: string) => {
    if (isLoading) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log("Verifying invitation code:", invitationCode);
      
      // Use the database function to validate the invitation code
      const { data, error: functionError } = await supabase.rpc(
        'validate_invitation_code',
        { code: invitationCode.toUpperCase() }
      );
      
      console.log("Validation result:", data, functionError);
      
      if (functionError) {
        console.error("Supabase function error:", functionError);
        throw new Error('Error validating code: ' + functionError.message);
      }
      
      // Check if we got a result and if the invitation is valid
      if (!data || data.length === 0 || !data[0].is_valid) {
        const message = data && data[0] ? data[0].message : 'Invalid invitation code';
        throw new Error(message);
      }
      
      // Extract the validation result
      const validationResult = data[0];
      
      // Handle code-only invitations (no email)
      if (validationResult.student_email && validationResult.student_email.trim() !== '') {
        setStudentEmail(validationResult.student_email);
      }
      
      setTeacherName(validationResult.teacher_name || '');
      setInvitationVerified(true);
      
      toast.success('Invitation verified', {
        description: `You've been invited by ${validationResult.teacher_name || 'a teacher'}`,
      });
      
    } catch (error: any) {
      console.error('Error validating invitation:', error);
      setError(error.message || 'Please check your invitation code and try again');
      setInvitationVerified(false);
      
      toast.error('Invalid invitation', {
        description: error.message || 'Please check your invitation code and try again',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (values: InvitationFormValues) => {
    await verifyInvitation(values.invitationCode);
  };

  const proceedToRegister = () => {
    // Save invitation data to session storage for the registration flow
    sessionStorage.setItem('invitationCode', form.getValues().invitationCode.toUpperCase());
    
    if (studentEmail) {
      sessionStorage.setItem('invitedEmail', studentEmail);
    }
    
    if (teacherName) {
      sessionStorage.setItem('teacherName', teacherName);
    }
    
    navigate('/register');
  };

  return {
    isLoading,
    invitationVerified,
    teacherEmail,
    studentEmail,
    teacherName,
    error,
    form,
    onSubmit,
    proceedToRegister
  };
};
