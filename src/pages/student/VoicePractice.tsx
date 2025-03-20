import React from 'react';
import StudentLayout from '@/components/layout/StudentLayout';
import { Mic } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';

const VoicePractice: React.FC = () => {
  const navigate = useNavigate();
  
  // Dados simulados - serão substituídos por dados reais posteriormente
  const voiceStats = {
    totalPractices: 12,
    bestAccuracy: 92,
    lastPracticeDate: '2023-11-15',
    averageScore: 85
  };
  
  const practiceCategories = [
    {
      id: 'pronunciation',
      title: 'Pronúncia',
      description: 'Pratique a pronúncia de palavras e frases em inglês',
      exercises: 24,
      level: 'Iniciante a Avançado'
    },
    {
      id: 'conversation',
      title: 'Conversação',
      description: 'Pratique diálogos e conversas cotidianas',
      exercises: 18,
      level: 'Intermediário a Avançado'
    },
    {
      id: 'listening',
      title: 'Compreensão Auditiva',
      description: 'Melhore sua habilidade de compreender inglês falado',
      exercises: 15,
      level: 'Todos os níveis'
    }
  ];
  
  const startPractice = (categoryId: string) => {
    navigate(`/student/voice-practice/session?category=${categoryId}`);
  };

  return (
    <StudentLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Mic className="h-6 w-6" /> Prática de Voz
          </h1>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Estatísticas de Prática</CardTitle>
              <CardDescription>
                Acompanhe seu progresso na prática de voz
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Total de Práticas</p>
                  <p className="text-2xl font-bold">{voiceStats.totalPractices}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Melhor Precisão</p>
                  <p className="text-2xl font-bold">{voiceStats.bestAccuracy}%</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Última Prática</p>
                  <p className="text-2xl font-bold">{voiceStats.lastPracticeDate}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Pontuação Média</p>
                  <p className="text-2xl font-bold">{voiceStats.averageScore}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Sobre a Prática de Voz</CardTitle>
              <CardDescription>
                Como funciona e benefícios
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                A prática de voz utiliza tecnologia avançada de reconhecimento de fala para ajudar você a melhorar 
                sua pronúncia e fluência em inglês. Fale com naturalidade e receba feedback instantâneo sobre 
                sua performance.
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" onClick={() => navigate('/student/voice-practice/session')}>
                Iniciar Prática Rápida
              </Button>
            </CardFooter>
          </Card>
        </div>
        
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="all">Todas Categorias</TabsTrigger>
            <TabsTrigger value="recommended">Recomendadas</TabsTrigger>
            <TabsTrigger value="recent">Recentes</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="mt-0">
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {practiceCategories.map((category) => (
                    <div key={category.id} className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 border rounded-lg">
                      <div className="mb-3 md:mb-0">
                        <h3 className="font-medium">{category.title}</h3>
                        <p className="text-sm text-muted-foreground">{category.description}</p>
                        <div className="flex gap-4 mt-1">
                          <span className="text-xs text-muted-foreground">{category.exercises} exercícios</span>
                          <span className="text-xs text-muted-foreground">Nível: {category.level}</span>
                        </div>
                      </div>
                      <Button 
                        onClick={() => startPractice(category.id)}
                        className="w-full md:w-auto"
                      >
                        Praticar
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="recommended" className="mt-0">
            <Card>
              <CardContent className="p-6 flex items-center justify-center min-h-[200px]">
                <p className="text-muted-foreground">Recomendações com base no seu perfil estarão disponíveis em breve.</p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="recent" className="mt-0">
            <Card>
              <CardContent className="p-6 flex items-center justify-center min-h-[200px]">
                <p className="text-muted-foreground">Suas atividades recentes aparecerão aqui.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </StudentLayout>
  );
};

export default VoicePractice;
