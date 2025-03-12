
import { useState, useEffect } from 'react';
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
  
  const navigate = useNavigate();
  const { code } = useParams<{ code?: string }>();
  const [searchParams] = useSearchParams();
  const codeFromQuery = searchParams.get('code');
  
  const form = useForm<InvitationFormValues>({
    resolver: zodResolver(invitationSchema),
    defaultValues: {
      invitationCode: code || codeFromQuery || '',
    },
  });

  // Automatically verify code if provided in URL
  useEffect(() => {
    const initialCode = code || codeFromQuery;
    if (initialCode && initialCode.length === 8) {
      console.log('Verifying initial code:', initialCode);
      form.setValue('invitationCode', initialCode);
      verifyInvitation(initialCode);
    }
  }, [code, codeFromQuery]);

  const verifyInvitation = async (invitationCode: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log("Verifying invitation code:", invitationCode);
      
      // Case-insensitive query for the invitation code
      const { data: invitation, error } = await supabase
        .from('student_invitations')
        .select(`
          *,
          invited_by:profiles(first_name, last_name)
        `)
        .ilike('invitation_code', invitationCode)
        .eq('status', 'pending')
        .maybeSingle();
      
      console.log("Invitation query result:", { invitation, error });
      
      if (error) {
        console.error("Supabase error:", error);
        throw new Error('Error validating code: ' + error.message);
      }
      
      if (!invitation) {
        throw new Error('This invitation code is invalid or has already been used');
      }
      
      // Check if the invitation has expired
      const expiresAt = new Date(invitation.expires_at);
      if (expiresAt < new Date()) {
        throw new Error('This invitation has expired. Please contact your teacher for a new invitation.');
      }
      
      // Get teacher information - now correctly typed
      const formattedTeacherName = invitation.invited_by ? 
        `${invitation.invited_by.first_name || ''} ${invitation.invited_by.last_name || ''}`.trim() : 
        'Your teacher';
      
      setStudentEmail(invitation.email);
      setTeacherName(formattedTeacherName);
      setInvitationVerified(true);
      
      toast.success('Invitation verified', {
        description: `You've been invited by ${formattedTeacherName}`,
      });
      
    } catch (error: any) {
      console.error('Error validating invitation:', error);
      setError(error.message || 'Please check your invitation code and try again');
      toast.error('Invalid invitation', {
        description: error.message || 'Please check your invitation code and try again',
      });
      setInvitationVerified(false);
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (values: InvitationFormValues) => {
    await verifyInvitation(values.invitationCode.toUpperCase());
  };

  const proceedToRegister = () => {
    if (studentEmail) {
      sessionStorage.setItem('invitationCode', form.getValues().invitationCode.toUpperCase());
      sessionStorage.setItem('invitedEmail', studentEmail);
      navigate('/register');
    }
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
