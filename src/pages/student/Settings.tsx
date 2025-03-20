
import React, { useState } from 'react';
import StudentLayout from '@/components/layout/StudentLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from 'sonner';
import { useOnboarding } from '@/components/student/OnboardingContext';
import { UploadCloud, User, Bell, Shield } from 'lucide-react';

const profileFormSchema = z.object({
  first_name: z.string().min(2, {
    message: "Nome deve ter pelo menos 2 caracteres.",
  }),
  last_name: z.string().min(2, {
    message: "Sobrenome deve ter pelo menos 2 caracteres.",
  }),
  email: z.string().email({
    message: "Por favor, insira um endereço de e-mail válido.",
  }).optional(),
  avatar_url: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

const StudentSettings: React.FC = () => {
  const queryClient = useQueryClient();
  const { completeStep, saveProgress } = useOnboarding();
  const [activeTab, setActiveTab] = useState('profile');
  
  // Busca os dados do perfil do usuário
  const { data: profile, isLoading: loadingProfile } = useQuery({
    queryKey: ['student-profile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('Usuário não autenticado');
      
      // Busca dados do perfil
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (error) throw error;
      
      // Busca email do usuário
      const { data: authData } = await supabase.auth.getUser();
      
      return {
        ...data,
        email: authData.user?.email || '',
      };
    }
  });
  
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      avatar_url: '',
    },
    mode: "onChange",
  });
  
  // Atualiza os valores do formulário quando os dados do perfil são carregados
  React.useEffect(() => {
    if (profile) {
      form.reset({
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        email: profile.email || '',
        avatar_url: profile.avatar_url || '',
      });
    }
  }, [profile, form]);
  
  const updateProfileMutation = useMutation({
    mutationFn: async (values: ProfileFormValues) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('Usuário não autenticado');
      
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: values.first_name,
          last_name: values.last_name,
          avatar_url: values.avatar_url,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);
      
      if (error) throw error;
      
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-profile'] });
      toast.success('Perfil atualizado com sucesso');
      
      // Marca a etapa "Completar Perfil" como concluída
      completeStep('Complete Profile');
      saveProgress();
    },
    onError: (error) => {
      console.error('Erro ao atualizar perfil:', error);
      toast.error('Falha ao atualizar perfil');
    }
  });
  
  const onSubmit = (values: ProfileFormValues) => {
    updateProfileMutation.mutate(values);
  };
  
  return (
    <StudentLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Configurações</h1>
          <p className="text-muted-foreground">
            Gerencie suas configurações e preferências de conta
          </p>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full sm:w-auto grid-cols-2 sm:grid-cols-3">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Perfil</span>
            </TabsTrigger>
            <TabsTrigger value="account" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Conta</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">Notificações</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Informações de Perfil</CardTitle>
                <CardDescription>
                  Atualize suas informações pessoais
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingProfile ? (
                  <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
                    <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
                  </div>
                ) : (
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <div className="flex flex-col sm:flex-row gap-4 items-start">
                        <div className="flex-shrink-0">
                          <Avatar className="h-20 w-20">
                            <AvatarImage src={profile?.avatar_url || ''} alt={profile?.first_name} />
                            <AvatarFallback>
                              {profile?.first_name?.charAt(0)}{profile?.last_name?.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                        
                        <div className="space-y-1">
                          <h3 className="font-medium">Foto de Perfil</h3>
                          <p className="text-sm text-muted-foreground">
                            Sua foto de perfil será visível para seus professores
                          </p>
                          <div className="mt-2">
                            <Button type="button" variant="outline" className="gap-2">
                              <UploadCloud className="h-4 w-4" />
                              Carregar Imagem
                            </Button>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                        <FormField
                          control={form.control}
                          name="first_name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nome</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="last_name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Sobrenome</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>E-mail</FormLabel>
                            <FormControl>
                              <Input {...field} disabled />
                            </FormControl>
                            <FormDescription>
                              Entre em contato com seu professor para atualizar seu endereço de e-mail
                            </FormDescription>
                          </FormItem>
                        )}
                      />
                      
                      <div className="flex justify-end">
                        <Button 
                          type="submit" 
                          disabled={!form.formState.isDirty || updateProfileMutation.isPending}
                        >
                          {updateProfileMutation.isPending ? 'Salvando...' : 'Salvar Alterações'}
                        </Button>
                      </div>
                    </form>
                  </Form>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Configurações de Aprendizado</CardTitle>
                <CardDescription>
                  Configure sua experiência de aprendizado
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label>Seu Papel</Label>
                    <div className="flex items-center mt-1">
                      <Badge variant="secondary">Estudante</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="account" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Segurança da Conta</CardTitle>
                <CardDescription>
                  Gerencie as configurações de segurança da sua conta
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Senha Atual</Label>
                    <Input type="password" id="current-password" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="new-password">Nova Senha</Label>
                    <Input type="password" id="new-password" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirmar Nova Senha</Label>
                    <Input type="password" id="confirm-password" />
                  </div>
                  
                  <Button className="mt-4">Alterar Senha</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="notifications" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Preferências de Notificação</CardTitle>
                <CardDescription>
                  Controle como você recebe notificações
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-muted-foreground">
                    As configurações de notificação estarão disponíveis em atualizações futuras.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </StudentLayout>
  );
};

export default StudentSettings;
