
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
import { Copy, Check, Share2, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';

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
  const [generationStep, setGenerationStep] = useState<string>('');

  const form = useForm<GenerateCodeFormValues>({
    resolver: zodResolver(generateCodeSchema),
    defaultValues: {
      note: '',
    },
  });

  // Function to generate a fallback code if trigger fails
  const generateFallbackCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  // Function to check if code exists in database
  const isCodeUnique = async (code: string): Promise<boolean> => {
    const { data, error } = await supabase
      .from('student_invitations')
      .select('id')
      .eq('invitation_code', code)
      .maybeSingle();
    
    if (error) {
      console.error('Error checking code uniqueness:', error);
      return false;
    }
    
    return !data; // Code is unique if no record found
  };

  // Function to fetch the updated invitation record with retry logic
  const fetchGeneratedCode = async (insertedId: string, maxRetries = 5): Promise<string | null> => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      console.log(`Attempt ${attempt} to fetch generated code for ID: ${insertedId}`);
      setGenerationStep(`Gerando código... (${attempt}/${maxRetries})`);
      
      // Wait a bit for the trigger to execute
      await new Promise(resolve => setTimeout(resolve, attempt * 200));
      
      const { data, error } = await supabase
        .from('student_invitations')
        .select('invitation_code')
        .eq('id', insertedId)
        .single();
      
      if (error) {
        console.error(`Attempt ${attempt} - Error fetching invitation:`, error);
        continue;
      }
      
      if (data?.invitation_code && data.invitation_code !== 'PENDING') {
        console.log(`Code generated successfully: ${data.invitation_code}`);
        return data.invitation_code;
      }
      
      console.log(`Attempt ${attempt} - Code still pending: ${data?.invitation_code}`);
    }
    
    return null;
  };

  const onSubmit = async (values: GenerateCodeFormValues) => {
    try {
      setIsGenerating(true);
      setGenerationStep('Verificando autenticação...');
      
      // Get current user
      const { data: userData, error: authError } = await supabase.auth.getUser();
      if (authError || !userData.user) {
        toast.error('Erro de autenticação', {
          description: 'Você precisa estar logado para gerar códigos de convite',
        });
        return;
      }

      console.log('Starting invitation code generation for user:', userData.user.id);
      
      setGenerationStep('Criando convite...');
      
      // Set expiration date (30 days from now for codes)
      const expiresAt = addDays(new Date(), 30).toISOString();

      // Insert invitation without email (for manual code sharing)
      const { data, error } = await supabase
        .from('student_invitations')
        .insert({
          invited_by: userData.user.id,
          expires_at: expiresAt,
          email: '', // Empty email for manual code sharing
          status: 'pending',
          invitation_code: 'PENDING' // This will be replaced by the trigger
        })
        .select('id')
        .single();

      if (error) {
        console.error('Erro ao inserir convite:', error);
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

      console.log('Invitation inserted with ID:', data.id);
      
      // Fetch the generated code with retry logic
      const generatedCode = await fetchGeneratedCode(data.id);
      
      if (generatedCode) {
        setInvitationCode(generatedCode);
        setGenerationStep('');
        
        toast.success('Código de convite gerado', {
          description: 'Copie e compartilhe este código com seu aluno',
        });
        
        form.reset();
        onSuccess(); // Refresh the invitations list
      } else {
        // Fallback: Generate code manually and update the record
        console.log('Trigger failed, using fallback code generation');
        setGenerationStep('Aplicando código alternativo...');
        
        let fallbackCode;
        let attempts = 0;
        const maxFallbackAttempts = 10;
        
        do {
          fallbackCode = generateFallbackCode();
          attempts++;
        } while (!(await isCodeUnique(fallbackCode)) && attempts < maxFallbackAttempts);
        
        if (attempts >= maxFallbackAttempts) {
          throw new Error('Não foi possível gerar um código único');
        }
        
        // Update the record with the fallback code
        const { error: updateError } = await supabase
          .from('student_invitations')
          .update({ invitation_code: fallbackCode })
          .eq('id', data.id);
        
        if (updateError) {
          console.error('Error updating with fallback code:', updateError);
          throw new Error('Falha ao aplicar código alternativo');
        }
        
        setInvitationCode(fallbackCode);
        setGenerationStep('');
        
        toast.success('Código de convite gerado', {
          description: 'Código gerado com método alternativo. Copie e compartilhe com seu aluno.',
        });
        
        form.reset();
        onSuccess(); // Refresh the invitations list
      }
      
    } catch (error: any) {
      console.error('Erro ao gerar código de convite:', error);
      setGenerationStep('');
      toast.error('Falha ao gerar código de convite', {
        description: error.message || 'Ocorreu um erro inesperado',
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

  const handleShareCode = async () => {
    if (invitationCode && navigator.share) {
      try {
        await navigator.share({
          title: 'Código de convite HelloPeople',
          text: `Aqui está seu código de convite para a plataforma HelloPeople: ${invitationCode}. Use-o para se registrar em hellopeoplebr.com.`
        });
        toast.success('Compartilhamento iniciado');
      } catch (err) {
        console.error('Falha ao compartilhar:', err);
        // Usuário pode ter cancelado o compartilhamento, então não mostramos erro
      }
    } else {
      handleCopyCode();
    }
  };

  // Reset the generated code and form
  const handleGenerateAnother = () => {
    setInvitationCode(null);
    setGenerationStep('');
    form.reset();
  };

  if (invitationCode) {
    return (
      <Card className="p-6 border-2 border-primary/20">
        <div className="space-y-6">
          <div className="bg-primary/10 p-6 rounded-lg text-center">
            <Badge variant="default" className="mb-2 bg-primary text-white">Código de Convite</Badge>
            <div className="text-3xl font-mono tracking-wider my-4 font-bold">{invitationCode}</div>
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
              {navigator.share && (
                <Button 
                  onClick={handleShareCode} 
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Share2 className="h-4 w-4" />
                  <span>Compartilhar</span>
                </Button>
              )}
              <Button onClick={handleGenerateAnother} variant="secondary">Gerar Outro</Button>
            </div>
          </div>
          
          <Alert>
            <AlertDescription>
              <p className="font-medium">Próximos passos:</p>
              <ol className="list-decimal pl-5 mt-2 space-y-1">
                <li>Compartilhe este código com seu aluno via WhatsApp, SMS ou pessoalmente</li>
                <li>O aluno deve acessar a plataforma e usar este código durante o registro</li>
                <li>Assim que registrado, o aluno aparecerá automaticamente na sua lista</li>
              </ol>
              <p className="mt-2 text-sm text-muted-foreground">Este código expirará em 30 dias se não for usado.</p>
            </AlertDescription>
          </Alert>
        </div>
      </Card>
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
              <FormLabel>Identificação (Opcional)</FormLabel>
              <FormControl>
                <Input placeholder="Ex: 'Aluno da turma 301', 'João Silva'" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button 
          type="submit" 
          className="w-full"
          disabled={isGenerating}
          size="lg"
        >
          {isGenerating ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>{generationStep || 'Gerando...'}</span>
            </div>
          ) : (
            'Gerar Código de Convite'
          )}
        </Button>
        
        {isGenerating && generationStep && (
          <div className="text-sm text-muted-foreground text-center">
            {generationStep}
          </div>
        )}
      </form>
    </Form>
  );
};

export default CodeGenerationForm;
