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
      console.log(`[DEBUG] Atualizando status do convite - Código: ${code}, ID do usuário: ${userId}, Nome: ${userName}`);
      
      // Primeiro, verifique se o convite existe
      const { data: invitationData, error: checkError } = await supabase
        .from('student_invitations')
        .select('id, status, email')
        .eq('invitation_code', code)
        .single();
      
      if (checkError) {
        console.error('[ERRO] Falha ao verificar o convite:', checkError);
        if (checkError.code === 'PGRST116') {
          console.log('[INFO] Convite não encontrado para código:', code);
        }
        return false;
      }
      
      console.log('[INFO] Convite encontrado:', invitationData);
      
      // Usar a função RPC para marcar o convite como usado
      const { data, error } = await supabase
        .rpc('mark_invitation_used', { 
          invitation_code_param: code,
          user_id_param: userId,
          user_name_param: userName
        });

      if (error) {
        console.error('[ERRO] Falha ao atualizar status do convite (RPC):', error);
        
        // Tente uma atualização direta como fallback
        console.log('[INFO] Tentando atualização direta como fallback...');
        const { error: updateError } = await supabase
          .from('student_invitations')
          .update({
            status: 'accepted',
            user_id: userId,
            used_by_name: userName,
            accepted_at: new Date().toISOString()
          })
          .eq('invitation_code', code);
        
        if (updateError) {
          console.error('[ERRO] Falha na atualização direta do convite:', updateError);
          return false;
        }
        
        console.log('[SUCESSO] Convite atualizado com sucesso (método de fallback)');
        
        // Invalidar consultas relacionadas para atualizar a UI
        console.log('[INFO] Notificando outros componentes sobre a atualização...');
        
        return true;
      }

      console.log('[SUCESSO] Convite atualizado via RPC:', data);
      return data;
    } catch (error) {
      console.error('[ERRO] Exceção ao atualizar status do convite:', error);
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

        toast.success("Login realizado com sucesso", {
          description: "Bem-vindo de volta! Redirecionando para seu painel...",
        });
        navigate('/dashboard');
      } 
      else if (type === 'register') {
        const registerValues = values as RegisterFormValues;
        
        if (hasInvitation && registerValues.invitationCode && validateCode) {
          const isValid = await validateCode(registerValues.invitationCode);
          if (!isValid) {
            toast.error("Convite inválido", {
              description: "Por favor, verifique seu código de convite",
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
          console.log('[INFO] Novo usuário registrado:', data.user.id);
          await createOnboardingRecord(data.user.id);

          const fullName = `${firstName} ${lastName}`.trim();
          
          if ((hasInvitation && registerValues.invitationCode) || 
              (invitationData?.isInvited && invitationData.code)) {
            const code = registerValues.invitationCode || invitationData?.code;
            if (code) {
              console.log('[INFO] Processando convite durante o registro:', code);
              const updated = await updateInvitationStatus(code, data.user.id, fullName);
              
              if (updated) {
                console.log('[SUCESSO] Convite aceito e atualizado com sucesso');
                toast.success("Conectado ao professor", {
                  description: "Você foi conectado com sucesso ao seu professor",
                });
              } else {
                console.warn('[ALERTA] Não foi possível atualizar o status do convite');
              }
            }
          }
        }

        toast.success("Registro realizado com sucesso", {
          description: "Sua conta foi criada. Bem-vindo ao HelloPeople!",
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

        toast.success("Link de redefinição enviado", {
          description: "Verifique seu e-mail para instruções de redefinição de senha.",
        });
        navigate('/login');
      }
    } catch (error: any) {
      console.error('[ERRO] Falha na autenticação:', error);
      toast.error("Erro de autenticação", {
        description: error.message || "Ocorreu um erro durante a autenticação. Por favor, tente novamente.",
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
