
import React, { useState } from 'react';
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
import { Badge } from '@/components/ui/badge';
import { Copy, Check } from 'lucide-react';

const generateCodeSchema = z.object({
  note: z.string().optional(),
});

type GenerateCodeFormValues = z.infer<typeof generateCodeSchema>;

interface CodeGenerationFormProps {
  onSuccess: () => void;
}

const CodeGenerationForm: React.FC<CodeGenerationFormProps> = ({ onSuccess }) => {
  const [invitationCode, setInvitationCode] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const form = useForm<GenerateCodeFormValues>({
    resolver: zodResolver(generateCodeSchema),
    defaultValues: {
      note: '',
    },
  });

  const onSubmit = async (values: GenerateCodeFormValues) => {
    try {
      setIsGenerating(true);
      
      // Get current user
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        toast.error('Erro de autenticação', {
          description: 'Você precisa estar logado para gerar códigos de convite',
        });
        return;
      }

      // Set expiration date (30 days from now for codes)
      const expiresAt = addDays(new Date(), 30).toISOString();

      // Insert invitation without email
      const { data, error } = await supabase
        .from('student_invitations')
        .insert({
          invited_by: userData.user.id,
          expires_at: expiresAt,
          email: '', // Empty email for manual code sharing
          status: 'pending',
          invitation_code: 'PENDING' // This will be replaced by the trigger
        })
        .select();

      if (error) {
        console.error('Erro ao gerar código de convite:', error);
        if (error.code === 'PGRST301') {
          toast.error('Permissão negada', {
            description: 'Você não tem permissão para gerar códigos de convite.',
          });
        } else {
          toast.error('Falha ao gerar código de convite', {
            description: error.message,
          });
        }
        return;
      }

      // Get the generated invitation code
      const invitation = data[0];
      setInvitationCode(invitation.invitation_code);
      
      toast.success('Código de convite gerado', {
        description: 'Copie e compartilhe este código com seu aluno',
      });
      
      form.reset();
      onSuccess();
    } catch (error: any) {
      console.error('Erro ao gerar código de convite:', error);
      toast.error('Falha ao gerar código de convite', {
        description: error.message,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Handler for copying code to clipboard
  const handleCopyCode = async () => {
    if (invitationCode) {
      try {
        await navigator.clipboard.writeText(invitationCode);
        setCopySuccess(true);
        toast.success('Código copiado para a área de transferência');
        
        setTimeout(() => {
          setCopySuccess(false);
        }, 2000);
      } catch (err) {
        console.error('Falha ao copiar código:', err);
        toast.error('Falha ao copiar código');
      }
    }
  };

  // Reset the generated code and form
  const handleGenerateAnother = () => {
    setInvitationCode(null);
    form.reset();
  };

  if (invitationCode) {
    return (
      <div className="space-y-6">
        <div className="bg-muted p-6 rounded-lg text-center">
          <Badge className="mb-2">Código de Convite</Badge>
          <div className="text-2xl font-mono tracking-wider my-3">{invitationCode}</div>
          <div className="flex justify-center gap-2 mt-4">
            <Button 
              onClick={handleCopyCode} 
              variant="outline" 
              className="flex items-center gap-2"
            >
              {copySuccess ? (
                <>
                  <Check className="h-4 w-4" />
                  <span>Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  <span>Copiar Código</span>
                </>
              )}
            </Button>
            <Button onClick={handleGenerateAnother} variant="secondary">Gerar Outro</Button>
          </div>
        </div>
        
        <Alert>
          <AlertDescription>
            <p>Compartilhe este código com seu aluno. Ele deverá informá-lo ao criar sua conta.</p>
            <p className="mt-2 text-sm text-muted-foreground">Este código expirará em 30 dias se não for usado.</p>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="note"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observação (Opcional)</FormLabel>
              <FormControl>
                <Input placeholder="Apenas para fins de controle" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button 
          type="submit" 
          className="w-full"
          disabled={isGenerating}
        >
          {isGenerating ? 'Gerando...' : 'Gerar Código de Convite'}
        </Button>
        
        <Alert>
          <AlertDescription>
            Você precisará compartilhar manualmente este código com seu aluno. Ele deverá informá-lo durante o cadastro.
          </AlertDescription>
        </Alert>
      </form>
    </Form>
  );
};

export default CodeGenerationForm;
