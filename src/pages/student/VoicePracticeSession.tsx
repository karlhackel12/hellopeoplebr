import React, { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Mic, MicOff, X, SkipForward, CheckCheck, Volume2, Loader2, ArrowLeft, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from '@/components/ui/use-toast';
import useVoicePractice from './hooks/useVoicePractice';

// Componente de visualização de onda sonora durante a gravação
const AudioVisualizer: React.FC<{ isActive: boolean }> = ({ isActive }) => {
  return (
    <div className={`flex justify-center items-center gap-1 h-6 transition-opacity duration-200 ${isActive ? 'opacity-100' : 'opacity-0'}`}>
      {[...Array(5)].map((_, i) => (
        <div 
          key={i}
          className="w-1 bg-primary rounded-full animate-pulse"
          style={{
            height: `${Math.random() * 16 + 8}px`,
            animationDelay: `${i * 0.15}s`
          }}
        />
      ))}
    </div>
  );
};

const VoicePracticeSession: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  // Extrair a categoria da URL se disponível
  const searchParams = new URLSearchParams(location.search);
  const category = searchParams.get('category') || 'general';
  
  // Gerenciamento de erros
  const handleError = (error: Error) => {
    toast({
      variant: 'destructive',
      title: 'Erro na prática de voz',
      description: error.message
    });
  };
  
  // Usar o hook de prática de voz
  const {
    messages,
    isRecording,
    isProcessing,
    isStreaming,
    startRecording,
    stopRecording,
    speakMessage,
    clearConversation,
    error
  } = useVoicePractice({
    category,
    onError: handleError
  });
  
  // Mostrar erros
  useEffect(() => {
    if (error) {
      handleError(error);
    }
  }, [error]);
  
  // Gerenciar a gravação
  const toggleRecording = async () => {
    try {
      if (isRecording) {
        stopRecording();
      } else {
        await startRecording();
      }
    } catch (err) {
      const recordingError = err instanceof Error ? err : new Error('Erro ao gerenciar gravação');
      handleError(recordingError);
    }
  };
  
  // Rolagem automática para a última mensagem
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);
  
  // Finalizar sessão
  const finishSession = () => {
    navigate('/student/voice-practice', { 
      state: { practiced: true } 
    });
  };
  
  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Cabeçalho */}
      <header className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => navigate('/student/voice-practice')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-medium">Prática de Voz - {category.charAt(0).toUpperCase() + category.slice(1)}</h1>
        </div>
        <Button variant="ghost" size="icon" onClick={() => navigate('/student/voice-practice')}>
          <X className="h-5 w-5" />
        </Button>
      </header>
      
      {/* Área de conversa */}
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="space-y-4 max-w-3xl mx-auto">
          {messages.map((message) => (
            <div 
              key={message.id} 
              className={`flex ${message.role === 'assistant' ? 'justify-start' : 'justify-end'}`}
            >
              <div className={`flex gap-3 max-w-[80%] ${message.role === 'assistant' ? 'flex-row' : 'flex-row-reverse'}`}>
                <Avatar className={message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}>
                  <AvatarFallback>
                    {message.role === 'user' ? 'U' : 'AI'}
                  </AvatarFallback>
                </Avatar>
                <div 
                  className={`rounded-lg px-4 py-3 ${
                    message.role === 'assistant' 
                      ? 'bg-muted text-foreground hover:bg-muted/80 cursor-pointer' 
                      : 'bg-primary text-primary-foreground'
                  }`}
                  onClick={() => message.role === 'assistant' && speakMessage(message.id)}
                >
                  <p>{message.content}</p>
                  {message.role === 'assistant' && (
                    <div className="text-xs text-muted-foreground mt-1 opacity-70">
                      Clique para ouvir
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {isProcessing && (
            <div className="flex justify-start">
              <div className="flex gap-3 max-w-[80%]">
                <Avatar className="bg-muted">
                  <AvatarFallback>AI</AvatarFallback>
                </Avatar>
                <div className="rounded-lg px-4 py-3 bg-muted text-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              </div>
            </div>
          )}
          
          {isStreaming && (
            <div className="flex justify-start">
              <div className="flex gap-3 max-w-[80%]">
                <Avatar className="bg-muted">
                  <AvatarFallback>AI</AvatarFallback>
                </Avatar>
                <div className="rounded-lg px-4 py-3 bg-muted text-foreground">
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 animate-pulse" />
                    <span>Processando em tempo real...</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
      
      {/* Barra de controles */}
      <div className="p-4 border-t bg-background">
        <div className="max-w-3xl mx-auto">
          <Card className="border-2 border-primary/10">
            <CardContent className="p-4">
              <div className="flex flex-col items-center">
                <AudioVisualizer isActive={isRecording} />
                
                <div className="flex justify-center gap-4 mt-4">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          size="lg" 
                          className={`rounded-full w-14 h-14 ${isRecording ? 'bg-red-500 hover:bg-red-600' : ''}`}
                          onClick={toggleRecording}
                          disabled={isProcessing && !isRecording}
                        >
                          {isRecording ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{isRecording ? 'Parar de gravar' : 'Começar a gravar'}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className="rounded-full w-10 h-10"
                          disabled={isProcessing || isRecording || messages.length <= 1}
                          onClick={() => messages.length > 1 && speakMessage(messages[messages.length - 1].id)}
                        >
                          <Volume2 className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Ouvir última resposta</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className="rounded-full w-10 h-10"
                          disabled={isProcessing || isRecording}
                          onClick={clearConversation}
                        >
                          <SkipForward className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Nova conversa</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className="rounded-full w-10 h-10"
                          disabled={isProcessing || isRecording}
                          onClick={finishSession}
                        >
                          <CheckCheck className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Finalizar sessão</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
              
              {isRecording ? (
                <p className="text-center mt-4 text-sm text-red-500 animate-pulse">
                  Gravando... Clique no botão do microfone para parar.
                </p>
              ) : isProcessing ? (
                <p className="text-center mt-4 text-sm text-muted-foreground">
                  Processando sua fala...
                </p>
              ) : isStreaming ? (
                <p className="text-center mt-4 text-sm text-muted-foreground">
                  Comunicação em tempo real ativa...
                </p>
              ) : (
                <p className="text-center mt-4 text-sm text-muted-foreground">
                  Clique no botão do microfone para começar a falar
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default VoicePracticeSession;
