
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Bell, Shield, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

const StudentSettings: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-2xl font-bold">Configurações</h1>
        <p className="text-muted-foreground">
          Gerencie suas preferências e configurações da conta.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="h-5 w-5 mr-2" />
              Perfil
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Nome</label>
              <p className="text-muted-foreground">Estudante</p>
            </div>
            <div>
              <label className="text-sm font-medium">Email</label>
              <p className="text-muted-foreground">estudante@exemplo.com</p>
            </div>
            <Button variant="outline">Editar Perfil</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className="h-5 w-5 mr-2" />
              Notificações
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Lembretes de estudo</span>
              <Button variant="outline" size="sm">Ativado</Button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Novas lições</span>
              <Button variant="outline" size="sm">Ativado</Button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Progresso semanal</span>
              <Button variant="outline" size="sm">Ativado</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              Privacidade
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Compartilhar progresso</span>
              <Button variant="outline" size="sm">Ativado</Button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Estatísticas públicas</span>
              <Button variant="outline" size="sm">Desativado</Button>
            </div>
            <Separator />
            <Button variant="outline" className="w-full">
              Alterar Senha
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <HelpCircle className="h-5 w-5 mr-2" />
              Suporte
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Precisa de ajuda? Entre em contato conosco.
            </p>
            <div className="space-y-2">
              <Button variant="outline" className="w-full">
                Central de Ajuda
              </Button>
              <Button variant="outline" className="w-full">
                Contatar Suporte
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StudentSettings;
