
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StudentLayout from '@/components/layout/StudentLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Mic, Headphones, MessageSquare, Play, Plus } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

export interface PracticeSession {
  id: string;
  name: string;
  category: string;
  icon: React.ReactNode;
  description: string;
}

export default function VoicePractice() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [recentSessions, setRecentSessions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Carregar sessões recentes
  useEffect(() => {
    const fetchRecentSessions = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setIsLoading(false);
          return;
        }
        
        const { data, error } = await supabase
          .from('voice_practice_sessions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5);
        
        if (error) throw error;
        
        setRecentSessions(data || []);
      } catch (err) {
        console.error('Erro ao carregar sessões recentes:', err);
        toast({
          variant: "destructive",
          title: "Erro ao carregar sessões",
          description: "Não foi possível carregar suas sessões recentes"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchRecentSessions();
  }, [toast]);

  // Iniciar nova sessão
  const startNewSession = async (category: string, name: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          variant: "destructive",
          title: "Erro de autenticação",
          description: "Você precisa estar logado para iniciar uma sessão"
        });
        return;
      }
      
      // Criar nova sessão no banco de dados
      const { data, error } = await supabase
        .from('voice_practice_sessions')
        .insert({
          user_id: user.id,
          topic: category, // Use topic em vez de category para corresponder ao esquema
          is_conversation: true,
          conversation_topic: name, // Armazenar o nome como conversation_topic
          difficulty_level: 1,
          status: 'in_progress' // Remover status que não existe na tabela
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Redirecionar para a sessão
      if (data) {
        navigate(`/student/voice-practice/session/${data.id}`);
      }
    } catch (err) {
      console.error('Erro ao criar nova sessão:', err);
      toast({
        variant: "destructive",
        title: "Erro ao criar sessão",
        description: "Não foi possível iniciar uma nova sessão"
      });
      
      // Em caso de erro, redirecionar para a sessão sem ID
      navigate('/student/voice-practice/session');
    }
  };

  // Continuar sessão existente
  const continueSession = (sessionId: string) => {
    navigate(`/student/voice-practice/session/${sessionId}`);
  };

  // Iniciar sessão rápida
  const startQuickSession = () => {
    navigate('/student/voice-practice/session');
  };

  const practiceModes: PracticeSession[] = [
    {
      id: 'conversation',
      name: 'Prática de Conversação',
      category: 'conversation',
      icon: <MessageSquare className="h-10 w-10 text-blue-500" />,
      description: 'Converse sobre tópicos do cotidiano para melhorar sua fluência'
    },
    {
      id: 'pronunciation',
      name: 'Pronúncia',
      category: 'pronunciation',
      icon: <Mic className="h-10 w-10 text-purple-500" />,
      description: 'Pratique a pronúncia de palavras e frases difíceis'
    },
    {
      id: 'listening',
      name: 'Compreensão Auditiva',
      category: 'listening',
      icon: <Headphones className="h-10 w-10 text-green-500" />,
      description: 'Teste sua compreensão auditiva com diversos exercícios'
    }
  ];

  return (
    <StudentLayout>
      <div className="container max-w-6xl py-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Prática de Pronúncia</h1>
            <p className="text-muted-foreground">
              Pratique sua pronúncia e conversação em inglês com nosso assistente de voz AI
            </p>
          </div>
          <Button onClick={startQuickSession}>
            <Plus className="mr-2 h-4 w-4" /> Iniciar Sessão Rápida
          </Button>
        </div>

        <Separator className="my-6" />

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-10">
          {practiceModes.map((mode) => (
            <Card key={mode.id} className="p-6 flex flex-col">
              <div className="mb-4">{mode.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{mode.name}</h3>
              <p className="text-muted-foreground mb-4 flex-1">{mode.description}</p>
              <Button 
                className="w-full mt-auto" 
                onClick={() => startNewSession(mode.category, mode.name)}
              >
                <Play className="mr-2 h-4 w-4" /> Iniciar Prática
              </Button>
            </Card>
          ))}
        </div>

        <h2 className="text-xl font-semibold mb-4">Sessões Recentes</h2>
        
        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2">
            {[1, 2].map((i) => (
              <Card key={i} className="p-4 h-24 animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </Card>
            ))}
          </div>
        ) : recentSessions.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {recentSessions.map((session) => (
              <Card 
                key={session.id} 
                className="p-4 flex justify-between items-center hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => continueSession(session.id)}
              >
                <div>
                  <h3 className="font-medium">{session.conversation_topic || 'Sessão de Prática'}</h3>
                  <p className="text-sm text-muted-foreground">
                    {new Date(session.created_at).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <Button variant="ghost" size="sm">
                  <Play className="h-4 w-4 mr-1" /> Continuar
                </Button>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-6 text-center">
            <p className="text-muted-foreground mb-4">
              Você ainda não tem sessões de prática. Comece agora mesmo!
            </p>
            <Button onClick={startQuickSession}>
              <Plus className="mr-2 h-4 w-4" /> Iniciar Primeira Sessão
            </Button>
          </Card>
        )}
      </div>
    </StudentLayout>
  );
}
