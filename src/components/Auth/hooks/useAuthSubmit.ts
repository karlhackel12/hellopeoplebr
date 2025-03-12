
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { LoginFormValues, RegisterFormValues, ForgotPasswordFormValues } from '../types';

export const useAuthSubmit = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const createOnboardingRecord = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('user_onboarding')
        .insert({
          user_id: userId,
          completed_steps: ['Create Account'],
          current_step_index: 1
        });

      if (error) {
        console.error('Error creating onboarding record:', error);
      }
    } catch (error) {
      console.error('Error creating onboarding record:', error);
    }
  };

  const updateInvitationStatus = async (code: string, userId: string, userName: string) => {
    try {
      const { data, error } = await supabase.rpc(
        'mark_invitation_used',
        { 
          invitation_code_param: code,
          user_id_param: userId,
          user_name_param: userName
        }
      );

      if (error) {
        console.error('Error updating invitation status:', error);
        return false;
      }

      return data;
    } catch (error) {
      console.error('Error updating invitation status:', error);
      return false;
    }
  };

  const handleSubmit = async (
    type: 'login' | 'register' | 'forgotPassword',
    values: LoginFormValues | RegisterFormValues | ForgotPasswordFormValues,
    validateCode?: (code: string) => Promise<boolean>,
    hasInvitation?: boolean,
    invitationData?: {
      email: string | null;
      code: string | null;
      isInvited: boolean;
    }
  ) => {
    setIsLoading(true);

    try {
      if (type === 'login') {
        const loginValues = values as LoginFormValues;
        const { data, error } = await supabase.auth.signInWithPassword({
          email: loginValues.email,
          password: loginValues.password,
        });

        if (error) throw error;

        toast.success("Login successful", {
          description: "Welcome back! Redirecting to your dashboard...",
        });
        navigate('/dashboard');
      } 
      else if (type === 'register') {
        const registerValues = values as RegisterFormValues;
        
        if (hasInvitation && registerValues.invitationCode && validateCode) {
          const isValid = await validateCode(registerValues.invitationCode);
          if (!isValid) {
            toast.error("Invalid invitation", {
              description: "Please check your invitation code",
            });
            setIsLoading(false);
            return;
          }
        }
        
        const nameParts = registerValues.name.split(' ');
        const firstName = nameParts[0];
        const lastName = nameParts.slice(1).join(' ');

        const { data, error } = await supabase.auth.signUp({
          email: registerValues.email,
          password: registerValues.password,
          options: {
            data: {
              first_name: firstName,
              last_name: lastName,
              role: registerValues.role,
            }
          }
        });

        if (error) throw error;

        if (data.user) {
          await createOnboardingRecord(data.user.id);

          const fullName = `${firstName} ${lastName}`.trim();
          
          if ((hasInvitation && registerValues.invitationCode) || 
              (invitationData?.isInvited && invitationData.code)) {
            const code = registerValues.invitationCode || invitationData?.code;
            if (code) {
              const updated = await updateInvitationStatus(code, data.user.id, fullName);
              
              if (updated) {
                toast.success("Connected to teacher", {
                  description: "You've been successfully connected to your teacher",
                });
              }
            }
          }
        }

        toast.success("Registration successful", {
          description: "Your account has been created. Welcome to HelloPeople!",
        });
        
        if (registerValues.role === 'teacher') {
          navigate('/teacher/dashboard');
        } else {
          navigate('/dashboard');
        }

        sessionStorage.removeItem('invitationCode');
        sessionStorage.removeItem('invitedEmail');
      } 
      else if (type === 'forgotPassword') {
        const forgotValues = values as ForgotPasswordFormValues;
        const { data, error } = await supabase.auth.resetPasswordForEmail(forgotValues.email);
        
        if (error) throw error;

        toast.success("Reset link sent", {
          description: "Check your email for password reset instructions.",
        });
        navigate('/login');
      }
    } catch (error: any) {
      toast.error("Authentication error", {
        description: error.message || "An error occurred during authentication. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    handleSubmit
  };
};
