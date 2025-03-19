import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Send, Loader2, X, ArrowLeft } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useVoicePractice } from '@/hooks/useVoicePractice';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ConversationMessage } from '@/types/voice';
import { AssignedLesson } from '@/types/lesson';
import { extractLessonVocabulary, extractLessonKeyPhrases, extractLessonTopics } from '@/utils/lessonUtils';
import { useRouter } from 'next/router';
import styles from './VoiceChatComponent.module.css';
import { cn } from '@/lib/utils';

interface VoiceChatComponentProps {
  assignedLessons?: AssignedLesson[];
}

/**
 * Componente para prática de conversação em inglês usando reconhecimento de voz
 * e integração com ChatGPT
 */
const VoiceChatComponent: React.FC<VoiceChatComponentProps> = ({ assignedLessons = [] }) => {
  const router = useRouter();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<string | null>(null);
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [keyPhrases, setKeyPhrases] = useState<string[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [partialResponse, setPartialResponse] = useState('');
  
  const { createSession } = useVoicePractice();
  const messageEndRef = useRef<HTMLDivElement>(null);
  const speechRecognition = useRef<SpeechRecognition | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Rolar para o final das mensagens quando novas mensagens são adicionadas
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, partialResponse]);

  // Extrair frases-chave da lição selecionada
  useEffect(() => {
    if (!selectedLesson || selectedLesson === 'free-practice') {
      setKeyPhrases([]);
      return;
    }

    const lesson = assignedLessons.find(l => l.id === selectedLesson);
    if (!lesson || !lesson.lesson.content) return;

    try {
      // Extrair vocabulário e frases-chave
      const vocabulary = extractLessonVocabulary(lesson.lesson);
      const phrases = extractLessonKeyPhrases(lesson.lesson);
      const topics = extractLessonTopics(lesson.lesson);
      
      // Combinar todos os termos relevantes
      const allPhrases = [...vocabulary, ...phrases, ...topics];
      setKeyPhrases(allPhrases);
      
      // Adicionar mensagem de boas-vindas com instrução para usar as frases
      if (allPhrases.length > 0 && messages.length === 0) {
        setMessages([
          {
            role: 'assistant',
            content: `Olá! Vamos praticar inglês sobre o tema "${lesson.lesson.title}". Tente usar estas frases-chave da lição durante nossa conversa. Quando estiver pronto, clique no botão do microfone e comece a falar em inglês.`,
            timestamp: new Date()
          }
        ]);
      }
    } catch (err) {
      console.error('Erro ao processar conteúdo da lição:', err);
    }
  }, [selectedLesson, assignedLessons, messages.length]);

  // Limpar recursos quando o componente é desmontado
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (speechRecognition.current) {
        speechRecognition.current.stop();
      }
    };
  }, []);

  /**
   * Inicia o reconhecimento de voz
   */
  const startListening = () => {
    if (!selectedLesson && assignedLessons.length > 0) {
      toast.error('Por favor, selecione uma lição primeiro');
      return;
    }
    
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast.error('Reconhecimento de voz não é suportado neste navegador');
      return;
    }
    
    // Inicializar o reconhecimento de voz
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    speechRecognition.current = new SpeechRecognition();
    speechRecognition.current.continuous = true;
    speechRecognition.current.interimResults = true;
    speechRecognition.current.lang = 'en-US';
    
    speechRecognition.current.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map(result => result[0])
        .map(result => result.transcript)
        .join('');
      
      setTranscript(transcript);
    };
    
    speechRecognition.current.onend = () => {
      if (isListening) {
        speechRecognition.current?.start();
      }
    };
    
    speechRecognition.current.start();
    setIsListening(true);
  };
  
  /**
   * Para o reconhecimento de voz
   */
  const stopListening = () => {
    if (speechRecognition.current) {
      speechRecognition.current.stop();
    }
    setIsListening(false);
  };
  
  /**
   * Inicia uma nova conversa
   */
  const startNewConversation = async () => {
    try {
      setMessages([]);
      setConversationId(null);
      
      if (selectedLesson && selectedLesson !== 'free-practice') {
        const lesson = assignedLessons.find(l => l.id === selectedLesson);
        if (lesson) {
          // Adicionar mensagem de boas-vindas
          setMessages([
            {
              role: 'assistant',
              content: `Olá! Vamos praticar inglês sobre o tema "${lesson.lesson.title}". Tente usar estas frases-chave da lição durante nossa conversa. Quando estiver pronto, clique no botão do microfone e comece a falar em inglês.`,
              timestamp: new Date()
            }
          ]);
        }
      } else {
        setMessages([
          {
            role: 'assistant',
            content: 'Olá! Vamos praticar inglês. Quando estiver pronto, clique no botão do microfone e comece a falar em inglês.',
            timestamp: new Date()
          }
        ]);
      }
    } catch (error) {
      console.error('Erro ao iniciar nova conversa:', error);
      toast.error('Erro ao iniciar nova conversa');
    }
  };
  
  /**
   * Envia a mensagem para o ChatGPT
   */
  const sendMessage = async () => {
    if (!transcript.trim()) return;
    
    try {
      setIsProcessing(true);
      setIsStreaming(true);
      setPartialResponse('');
      
      // Criar cópia do transcript antes de limpar
      const userMessage = transcript;
      
      // Limpar o transcript
      setTranscript('');
      
      // Adicionar mensagem do usuário
      setMessages(prev => [
        ...prev,
        { role: 'user', content: userMessage, timestamp: new Date() }
      ]);
      
      // Obter dados da lição se selecionada
      let lessonId = null;
      let assignmentId = null;
      let lessonTopics: string[] = [];
      let vocabularyItems: string[] = [];
      
      if (selectedLesson && selectedLesson !== 'free-practice') {
        const lesson = assignedLessons.find(l => l.id === selectedLesson);
        if (lesson) {
          assignmentId = lesson.id;
          lessonId = lesson.lesson_id;
          
          // Extrair tópicos e vocabulário usando os utilitários centralizados
          lessonTopics = extractLessonTopics(lesson.lesson);
          vocabularyItems = extractLessonVocabulary(lesson.lesson);
        }
      }
      
      // Chamar a função do Supabase para processar a conversa
      const { data: authData } = await supabase.auth.getUser();
      const userId = authData?.user?.id;
      
      if (!userId) {
        toast.error('Usuário não autenticado');
        setIsProcessing(false);
        setIsStreaming(false);
        return;
      }

      // Criar novo AbortController para esta requisição
      abortControllerRef.current = new AbortController();
      
      // Chamar a função de voice conversation no Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('voice-conversation', {
        body: {
          userTranscript: userMessage,
          conversationId,
          lessonTopics,
          vocabularyItems,
          difficulty: 2, // Dificuldade média
          userId,
          lessonId,
          assignmentId
        },
        signal: abortControllerRef.current.signal
      });
      
      if (error) {
        console.error('Erro na função de voz:', error);
        // Verificar se é um erro de autenticação
        if (error.message.includes('401') || error.message.includes('403')) {
          toast.error('Erro de autenticação. Por favor, faça login novamente.');
          // Aqui você pode adicionar lógica para redirecionar para a página de login
          return;
        }
        // Verificar se é um erro de rate limit
        if (error.message.includes('429')) {
          toast.error('Muitas requisições. Por favor, aguarde um momento e tente novamente.');
          return;
        }
        // Verificar se é um erro de timeout
        if (error.message.includes('timeout')) {
          toast.error('A requisição demorou muito. Por favor, tente novamente.');
          return;
        }
        // Erro genérico
        toast.error('Erro ao processar a conversa. Por favor, tente novamente.');
        setIsProcessing(false);
        setIsStreaming(false);
        return;
      }
      
      // Atualizar o ID da conversa
      if (data.conversationId) {
        setConversationId(data.conversationId);
        
        // Se for a primeira mensagem, criar uma sessão de prática
        if (!conversationId && selectedLesson && selectedLesson !== 'free-practice') {
          const lesson = assignedLessons.find(l => l.id === selectedLesson);
          if (lesson) {
            createSession({ 
              lessonId: lesson.lesson_id,
              topic: lesson.lesson.title,
              difficultyLevel: 2,
              vocabularyItems,
              assignmentId: lesson.id
            });
          }
        }
      }
      
      // Adicionar resposta do assistente
      if (data.response) {
        setMessages(prev => [
          ...prev,
          { role: 'assistant', content: data.response, timestamp: new Date() }
        ]);
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('Requisição cancelada');
        return;
      }
      console.error('Erro ao enviar mensagem:', error);
      toast.error('Erro ao enviar mensagem. Por favor, tente novamente.');
    } finally {
      setIsProcessing(false);
      setIsStreaming(false);
      setPartialResponse('');
    }
  };

  // Função para cancelar a requisição em andamento
  const cancelRequest = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsStreaming(false);
      setPartialResponse('');
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header com botão de voltar */}
      <div className="fixed top-0 left-0 right-0 z-10 bg-white/80 backdrop-blur-sm border-b">
        <div className="container max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/')}
            className="hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className="container max-w-2xl mx-auto px-4 pt-20 pb-32">
        {/* Seletor de lição - só mostrar se houver lições disponíveis */}
        {assignedLessons.length > 0 && (
          <div className="mb-4">
            <Select
              value={selectedLesson || ''}
              onValueChange={setSelectedLesson}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione uma lição para praticar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="free-practice">Prática Livre</SelectItem>
                {assignedLessons.map((lesson) => (
                  <SelectItem key={lesson.id} value={lesson.id}>
                    {lesson.lesson.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="space-y-4">
          {/* Área de mensagens */}
          <div className="min-h-[60vh] space-y-6">
            {messages.map((message, index) => (
              <div
                key={index}
                className={cn(
                  'flex',
                  message.role === 'user' ? 'justify-end' : 'justify-start',
                  styles.messageContainer
                )}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div
                  className={cn(
                    'max-w-[80%] rounded-2xl px-4 py-3',
                    message.role === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-900'
                  )}
                >
                  <p className="text-sm">{message.content}</p>
                </div>
              </div>
            ))}
            {partialResponse && (
              <div className={cn('flex justify-start', styles.messageContainer)}>
                <div className="max-w-[80%] rounded-2xl px-4 py-3 bg-gray-100">
                  <p className="text-sm">{partialResponse}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer com controles de voz */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t">
        <div className="container max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-center space-x-4">
            {/* Botão de gravação circular grande */}
            <Button
              variant={isListening ? 'destructive' : 'outline'}
              size="lg"
              className={cn(
                'rounded-full w-16 h-16 p-0',
                styles.voiceButton,
                isListening 
                  ? 'bg-red-500 hover:bg-red-600' 
                  : 'bg-blue-500 hover:bg-blue-600 text-white',
                isListening && styles.pulsingDot
              )}
              onClick={isListening ? stopListening : startListening}
              disabled={isProcessing || isStreaming}
            >
              {isListening ? (
                <MicOff className="h-6 w-6" />
              ) : (
                <Mic className="h-6 w-6" />
              )}
            </Button>

            {/* Botão de enviar ou cancelar */}
            {(transcript || isStreaming) && (
              <Button
                variant={isStreaming ? 'destructive' : 'default'}
                size="lg"
                className={cn('rounded-full', styles.voiceButton)}
                onClick={isStreaming ? cancelRequest : sendMessage}
                disabled={(!transcript.trim() && !isStreaming) || isProcessing}
              >
                {isProcessing || isStreaming ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isStreaming ? 'Cancelar' : 'Processando'}
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Enviar
                  </>
                )}
              </Button>
            )}
          </div>

          {/* Área de transcrição */}
          {transcript && (
            <div className={cn('mt-4 p-3 bg-gray-50 rounded-lg', styles.transcriptContainer)}>
              <p className="text-sm text-gray-600">{transcript}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VoiceChatComponent; 