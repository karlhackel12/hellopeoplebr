import React, { useState, useEffect } from 'react';
import StudentLayout from '@/components/layout/StudentLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, KeyRound, Phone } from 'lucide-react';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import { useOnboarding } from '@/components/student/OnboardingContext';

const passwordSchema = z.object({
  password: z.string()
    .min(8, "A senha deve ter pelo menos 8 caracteres")
    .max(72, "A senha não pode ter mais de 72 caracteres")
    .regex(/[A-Z]/, "A senha deve conter pelo menos 1 letra maiúscula")
    .regex(/[a-z]/, "A senha deve conter pelo menos 1 letra minúscula")
    .regex(/[0-9]/, "A senha deve conter pelo menos 1 número"),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "As senhas não correspondem",
  path: ["confirmPassword"],
});

const phoneSchema = z.object({
  phone: z.string()
    .min(10, "O telefone deve ter pelo menos 10 dígitos")
    .max(15, "O telefone deve ter no máximo 15 dígitos")
    .regex(/^\+?[0-9\s\-\(\)]+$/, "Formato de telefone inválido"),
});

const StudentSettings: React.FC = () => {
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [isUpdatingPhone, setIsUpdatingPhone] = useState(false);
  const { completeStep, saveProgress } = useOnboarding();
  
  // Busca o perfil do usuário
  const { data: profile } = useQuery({
    queryKey: ['student-profile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('Usuário não autenticado');
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (error) throw error;
      
      return data;
    }
  });

  // Formulário de senha
  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  // Formulário de telefone
  const phoneForm = useForm<z.infer<typeof phoneSchema>>({
    resolver: zodResolver(phoneSchema),
    defaultValues: {
      phone: '',
    },
  });

  // Atualiza o formulário de telefone quando o perfil é carregado
  useEffect(() => {
    if (profile && profile.phone) {
      phoneForm.setValue('phone', profile.phone);
    }
  }, [profile, phoneForm]);

  // Envio do formulário de senha
  const onPasswordSubmit = async (values: z.infer<typeof passwordSchema>) => {
    try {
      setIsUpdatingPassword(true);
      
      const { error } = await supabase.auth.updateUser({ 
        password: values.password 
      });
      
      if (error) throw error;
      
      toast.success('Senha atualizada com sucesso');
      passwordForm.reset();
      
      // Marca a etapa de completar o perfil como concluída
      completeStep('Complete Profile');
      saveProgress();
    } catch (error: any) {
      console.error('Erro ao atualizar senha:', error);
      toast.error('Falha ao atualizar senha', {
        description: error.message
      });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  // Envio do formulário de telefone
  const onPhoneSubmit = async (values: z.infer<typeof phoneSchema>) => {
    try {
      setIsUpdatingPhone(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('Usuário não autenticado');
      
      const { error } = await supabase
        .from('profiles')
        .update({
          phone: values.phone,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);
      
      if (error) throw error;
      
      toast.success('Número de telefone atualizado com sucesso');
      
      // Marca a etapa de completar o perfil como concluída
      completeStep('Complete Profile');
      saveProgress();
    } catch (error: any) {
      console.error('Erro ao atualizar telefone:', error);
      toast.error('Falha ao atualizar telefone', {
        description: error.message
      });
    } finally {
      setIsUpdatingPhone(false);
    }
  };

  return (
    <StudentLayout>
      <div className="space-y-6 max-w-3xl mx-auto animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Configurações da Conta</h1>
          <p className="text-muted-foreground">
            Gerencie a segurança e contato da sua conta
          </p>
        </div>
        
        <div className="space-y-6">
          {/* Atualização de Senha */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <KeyRound className="h-5 w-5 text-muted-foreground" />
                <CardTitle>Alterar Senha</CardTitle>
              </div>
              <CardDescription>
                Atualize sua senha para manter sua conta segura
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...passwordForm}>
                <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                  <FormField
                    control={passwordForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nova Senha</FormLabel>
                        <FormControl>
                          <Input 
                            type="password" 
                            placeholder="Nova senha" 
                            {...field} 
                            autoComplete="new-password"
                          />
                        </FormControl>
                        <FormDescription>
                          Mínimo de 8 caracteres, incluindo uma letra maiúscula e um número
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={passwordForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirmar Senha</FormLabel>
                        <FormControl>
                          <Input 
                            type="password" 
                            placeholder="Confirme sua nova senha" 
                            {...field} 
                            autoComplete="new-password"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex justify-end">
                    <Button 
                      type="submit" 
                      disabled={isUpdatingPassword || !passwordForm.formState.isDirty}
                    >
                      {isUpdatingPassword ? (
                        <span className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Atualizando...
                        </span>
                      ) : "Atualizar Senha"}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
          
          {/* Atualização de Telefone */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Phone className="h-5 w-5 text-muted-foreground" />
                <CardTitle>Número de Telefone</CardTitle>
              </div>
              <CardDescription>
                Adicione ou atualize seu número de telefone para contato
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...phoneForm}>
                <form onSubmit={phoneForm.handleSubmit(onPhoneSubmit)} className="space-y-4">
                  <FormField
                    control={phoneForm.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Número de Telefone</FormLabel>
                        <FormControl>
                          <Input 
                            type="tel" 
                            placeholder="+55 (11) 98765-4321" 
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          Formato: +55 (DDD) NÚMERO
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex justify-end">
                    <Button 
                      type="submit" 
                      disabled={isUpdatingPhone || !phoneForm.formState.isDirty}
                    >
                      {isUpdatingPhone ? (
                        <span className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Atualizando...
                        </span>
                      ) : "Atualizar Telefone"}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </StudentLayout>
  );
};

export default StudentSettings;
