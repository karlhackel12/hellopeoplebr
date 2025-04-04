
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { addDays } from 'date-fns';

const inviteSchema = z.object({
  email: z.string().email({ message: 'Por favor, insira um endereço de email válido' }),
});

type InviteFormValues = z.infer<typeof inviteSchema>;

interface EmailInviteFormProps {
  onSuccess: () => void;
}

const EmailInviteForm: React.FC<EmailInviteFormProps> = ({ onSuccess }) => {
  const form = useForm<InviteFormValues>({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (values: InviteFormValues) => {
    try {
      // Get current user
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        toast.error('Erro de autenticação', {
          description: 'Você precisa estar logado para convidar alunos',
        });
        return;
      }

      // Get user profile to get the teacher's name
      const { data: profileData } = await supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('id', userData.user.id)
        .single();

      // Set expiration date (7 days from now)
      const expiresAt = addDays(new Date(), 7).toISOString();

      // Insert invitation - note that invitation_code is automatically generated by a trigger
      const { data, error } = await supabase
        .from('student_invitations')
        .insert({
          email: values.email,
          invited_by: userData.user.id,
          expires_at: expiresAt,
          status: 'pending',
          // The invitation_code field is generated via a trigger in the database
          invitation_code: 'PENDING' // This value will be overwritten by the trigger
        })
        .select();

      if (error) {
        console.error('Erro ao criar convite:', error);
        if (error.code === '23505') {
          toast.error('Convite já enviado', {
            description: 'Você já convidou este aluno',
          });
        } else if (error.code === 'PGRST301') {
          toast.error('Permissão negada', {
            description: 'Você não tem permissão para enviar convites. Por favor, verifique o status da sua conta.',
          });
        } else {
          toast.error('Falha ao enviar convite', {
            description: error.message,
          });
        }
        return;
      }

      // Get the generated invitation code from the returned data
      const invitation = data[0];
      
      // Format teacher name for the email
      const teacherName = profileData
        ? `${profileData.first_name || ''} ${profileData.last_name || ''}`.trim()
        : 'Seu professor';

      // Send the invitation email using our edge function
      const { error: emailError } = await supabase.functions.invoke('send-invitation-email', {
        body: {
          email: values.email,
          invitation_code: invitation.invitation_code,
          teacher_name: teacherName
        }
      });

      if (emailError) {
        console.error('Erro ao enviar email de convite:', emailError);
        toast.warning('Convite criado mas falha no envio do email', {
          description: 'O convite foi criado, mas não foi possível enviar o email. O aluno ainda pode usar o código de convite.',
        });
      } else {
        toast.success('Convite enviado', {
          description: `Um convite foi enviado para ${values.email}`,
        });
      }
      
      form.reset();
      onSuccess();
    } catch (error: any) {
      console.error('Erro ao enviar convite:', error);
      toast.error('Falha ao enviar convite', {
        description: error.message,
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email do Aluno</FormLabel>
              <FormControl>
                <Input placeholder="aluno@exemplo.com" type="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button 
          type="submit" 
          className="w-full"
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting ? 'Enviando...' : 'Enviar Convite'}
        </Button>
        
        <Alert>
          <AlertDescription>
            Um email será enviado ao aluno com instruções para se juntar à plataforma.
          </AlertDescription>
        </Alert>
      </form>
    </Form>
  );
};

export default EmailInviteForm;
