
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import StudentLayout from '@/components/layout/StudentLayout';
import { Button } from '@/components/ui/button';
import { Mic, StopCircle, RefreshCw, Play, Volume2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Card } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { useToast } from '@/components/ui/use-toast';
import useVoicePractice, { Message } from './hooks/useVoicePractice';
import { supabase } from '@/integrations/supabase/client';

export default function VoicePracticeSession() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [topic, setTopic] = useState<string>('conversation');
  const [sessionName, setSessionName] = useState<string>('Prática de Conversação');
  
  const { 
    messages, 
    isRecording, 
    isProcessing,
    startRecording, 
    stopRecording, 
    speakMessage,
    clearConversation,
    error,
    isStreaming
  } = useVoicePractice({
    category: topic, // Mudamos de category para topic para consistência
    onError: (err) => {
      toast({
        variant: "destructive",
        title: "Erro na prática de voz",
        description: err.message || "Ocorreu um erro durante a prática de voz"
      });
    },
    simulationMode: true // Usar modo de simulação para testes
  });

  // Carregar dados da sessão se um ID for fornecido
  useEffect(() => {
    const loadSessionData = async () => {
      if (!sessionId) return;
      
      try {
        const { data, error } = await supabase
          .from('voice_practice_sessions')
          .select('topic, conversation_topic') // Usar os campos corretos da tabela
          .eq('id', sessionId)
          .single();
        
        if (error) throw error;
        if (data) {
          setTopic(data.topic || 'conversation');
          setSessionName(data.conversation_topic || 'Prática de Conversação');
        }
      } catch (err) {
        console.error('Erro ao carregar dados da sessão:', err);
        toast({
          variant: "destructive",
          title: "Erro ao carregar sessão",
          description: "Não foi possível carregar os dados da sessão de prática"
        });
      }
    };
    
    loadSessionData();
  }, [sessionId, toast]);

  // Rolar para o final das mensagens quando novas mensagens chegarem
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Lidar com erros do hook
  useEffect(() => {
    if (error) {
      toast({
        variant: "destructive",
        title: "Erro na prática de voz",
        description: error.message || "Ocorreu um erro durante a prática de voz"
      });
    }
  }, [error, toast]);

  // Iniciar gravação com segurança
  const handleStartRecording = async () => {
    try {
      await startRecording();
    } catch (err) {
      console.error('Erro ao iniciar gravação:', err);
      toast({
        variant: "destructive",
        title: "Erro ao iniciar gravação",
        description: err instanceof Error ? err.message : "Não foi possível acessar o microfone"
      });
    }
  };

  // Encerrar sessão e voltar
  const handleEndSession = () => {
    navigate('/student/voice-practice');
  };

  // Iniciar nova conversa
  const handleNewConversation = () => {
    clearConversation();
  };

  return (
    <StudentLayout>
      <div className="container max-w-5xl py-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold">{sessionName}</h1>
            <p className="text-muted-foreground">
              Pratique seu inglês falado com nosso assistente de voz AI
            </p>
          </div>
          <Button variant="outline" onClick={handleEndSession}>
            Finalizar Sessão
          </Button>
        </div>

        <Separator className="my-4" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <Card className="p-4 h-[600px] flex flex-col">
              <div className="flex-1 overflow-y-auto mb-4 space-y-4">
                {messages.map((message) => (
                  <MessageBubble 
                    key={message.id} 
                    message={message}
                    onPlay={() => speakMessage(message.id)}
                  />
                ))}
                <div ref={messagesEndRef} />
              </div>

              <div className="flex items-center gap-3 pt-2 border-t">
                <Button
                  size="lg" 
                  className="gap-2 flex-1"
                  disabled={isRecording || isProcessing || isStreaming}
                  onClick={handleStartRecording}
                >
                  <Mic className="h-5 w-5" />
                  {isProcessing ? "Processando..." : "Iniciar Gravação"}
                </Button>
                
                {isRecording && (
                  <Button 
                    variant="destructive"
                    size="lg"
                    className="gap-2"
                    onClick={stopRecording}
                  >
                    <StopCircle className="h-5 w-5" />
                    Parar
                  </Button>
                )}
                
                <Button
                  variant="outline"
                  size="icon"
                  disabled={isRecording || isProcessing || isStreaming}
                  onClick={handleNewConversation}
                  title="Nova conversa"
                >
                  <RefreshCw className="h-5 w-5" />
                </Button>
              </div>
            </Card>
          </div>

          <div className="space-y-4">
            <Card className="p-4">
              <h3 className="text-lg font-medium mb-2">Dicas de Prática</h3>
              <ul className="space-y-2 text-sm">
                <li>• Fale claramente e em um ritmo natural</li>
                <li>• Ouça a resposta do assistente com atenção</li>
                <li>• Experimente responder com frases completas</li>
                <li>• Não tenha medo de cometer erros</li>
                <li>• Pratique sobre tópicos do seu interesse</li>
              </ul>
            </Card>

            <Card className="p-4">
              <h3 className="text-lg font-medium mb-2">Status da Sessão</h3>
              <div className="space-y-2 text-sm">
                <p>
                  <span className="font-medium">Modo:</span> {sessionName}
                </p>
                <p>
                  <span className="font-medium">Status:</span>{" "}
                  {isRecording ? (
                    <span className="text-red-500 flex items-center gap-1">
                      <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                      </span>
                      Gravando
                    </span>
                  ) : isProcessing ? (
                    <span className="text-yellow-500">Processando</span>
                  ) : (
                    <span className="text-green-500">Pronto</span>
                  )}
                </p>
                <p>
                  <span className="font-medium">Mensagens:</span> {messages.length}
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </StudentLayout>
  );
}

interface MessageBubbleProps {
  message: Message;
  onPlay: () => void;
}

function MessageBubble({ message, onPlay }: MessageBubbleProps) {
  const isUser = message.role === 'user';
  
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex gap-3 max-w-[80%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        <Avatar className={`h-10 w-10 ${isUser ? 'bg-primary' : 'bg-secondary'}`}>
          {/* <AvatarImage src={isUser ? "/user-avatar.png" : "/ai-avatar.png"} /> */}
          <div className="flex items-center justify-center h-full w-full text-white">
            {isUser ? "EU" : "AI"}
          </div>
        </Avatar>
        
        <div className={`rounded-lg p-3 text-sm ${
          isUser 
            ? 'bg-primary text-primary-foreground' 
            : 'bg-secondary text-secondary-foreground'
        }`}>
          <div className="flex flex-col">
            <div className="whitespace-pre-wrap mb-2">
              {message.content}
            </div>
            
            {!isUser && (
              <div className="flex justify-end">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 px-2 text-xs"
                  onClick={onPlay}
                >
                  <Volume2 className="h-4 w-4 mr-1" />
                  Ouvir
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
