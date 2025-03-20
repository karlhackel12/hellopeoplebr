
import React from 'react';
import TeacherLayout from '@/components/layout/TeacherLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useIsMobile } from '@/hooks/use-mobile';

const Settings: React.FC = () => {
  const isMobile = useIsMobile();

  return (
    <TeacherLayout pageTitle="Configurações">
      <div className="mb-8 animate-fade-in">
        {!isMobile && <h1 className="text-3xl font-bold mb-6">Configurações</h1>}
        
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className={`mb-6 ${isMobile ? 'w-full' : ''}`}>
            <TabsTrigger value="profile" className={isMobile ? 'flex-1' : ''}>Perfil</TabsTrigger>
            <TabsTrigger value="account" className={isMobile ? 'flex-1' : ''}>Conta</TabsTrigger>
            <TabsTrigger value="preferences" className={isMobile ? 'flex-1' : ''}>Preferências</TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Informações do Perfil</CardTitle>
                <CardDescription>
                  Atualize suas informações pessoais visíveis para os alunos.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Nome</Label>
                    <Input id="firstName" placeholder="Seu nome" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Sobrenome</Label>
                    <Input id="lastName" placeholder="Seu sobrenome" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="bio">Biografia</Label>
                  <textarea 
                    id="bio" 
                    className="w-full min-h-[120px] p-2 border rounded-md resize-y" 
                    placeholder="Conte aos alunos sobre você..."
                  />
                </div>
                
                <div className="flex justify-end">
                  <Button type="submit">Salvar Alterações</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="account">
            <Card>
              <CardHeader>
                <CardTitle>Configurações da Conta</CardTitle>
                <CardDescription>
                  Gerencie os detalhes da sua conta e configurações de segurança.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Endereço de E-mail</Label>
                  <Input id="email" type="email" placeholder="seu@email.com" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Alterar Senha</Label>
                  <Input id="password" type="password" placeholder="Nova senha" />
                </div>
                
                <div className="flex justify-end">
                  <Button type="submit">Atualizar Conta</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="preferences">
            <Card>
              <CardHeader>
                <CardTitle>Preferências de Ensino</CardTitle>
                <CardDescription>
                  Personalize sua experiência de ensino.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-center py-4 text-muted-foreground">
                  Configurações de preferências em breve!
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </TeacherLayout>
  );
};

export default Settings;
