import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Send, Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useVoicePractice } from '../../hooks/useVoicePractice';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

// Interface para lições atribuídas
interface AssignedLesson {
  id: string;
  title: string;
  description?: string;
  lesson_id: string;
  lesson: {
    id: string;
    title: string;
    content: any;
  };
}

interface ConversationMessage {
  id?: string;
  role: 'assistant' | 'user';
  content: string;
  timestamp?: Date;
}

const VoiceChatComponent: React.FC<{ assignedLessons: AssignedLesson[] }> = ({ assignedLessons }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<string | null>(null);
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [keyPhrases, setKeyPhrases] = useState<string[]>([]);
  
  const { createSession } = useVoicePractice();
  const messageEndRef = useRef<HTMLDivElement>(null);
  const speechRecognition = useRef<typeof window.SpeechRecognition | null>(null);

  // Rolar para o final das mensagens quando novas mensagens são adicionadas
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Extrair frases-chave da lição selecionada
  useEffect(() => {
    if (!selectedLesson) {
      setKeyPhrases([]);
      return;
    }

    const lesson = assignedLessons.find(l => l.id === selectedLesson);
    if (!lesson || !lesson.lesson.content) return;

    try {
      // Presumindo que o conteúdo da lição está em formato JSON
      let lessonContent = lesson.lesson.content;
      if (typeof lessonContent === 'string') {
        lessonContent = JSON.parse(lessonContent);
      }
      
      // Extrair vocabulário e frases-chave
      let phrases: string[] = [];
      
      // Verificar se há uma seção de vocabulário
      if (lessonContent.vocabulary && Array.isArray(lessonContent.vocabulary)) {
        phrases = lessonContent.vocabulary.map((v: any) => 
          typeof v === 'string' ? v : v.term
        );
      }
      
      // Verificar se há uma seção de expressões-chave
      if (lessonContent.keyPhrases && Array.isArray(lessonContent.keyPhrases)) {
        phrases = [...phrases, ...lessonContent.keyPhrases];
      }
      
      // Verificar se há seção de tópicos
      if (lessonContent.topics && Array.isArray(lessonContent.topics)) {
        phrases = [...phrases, ...lessonContent.topics];
      }
      
      setKeyPhrases(phrases);
      
      // Adicionar mensagem de boas-vindas com instrução para usar as frases
      if (phrases.length > 0 && messages.length === 0) {
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
  }, [selectedLesson, assignedLessons]);

  // Iniciar reconhecimento de voz
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
  
  // Parar reconhecimento de voz
  const stopListening = () => {
    if (speechRecognition.current) {
      speechRecognition.current.stop();
    }
    setIsListening(false);
  };
  
  // Iniciar uma nova conversa
  const startNewConversation = async () => {
    try {
      setMessages([]);
      setConversationId(null);
      
      if (selectedLesson) {
        const lesson = assignedLessons.find(l => l.id === selectedLesson);
        if (lesson) {
          // Extrair tópicos e vocabulário
          let lessonContent = lesson.lesson.content;
          if (typeof lessonContent === 'string') {
            lessonContent = JSON.parse(lessonContent);
          }
          
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
  
  // Enviar mensagem para o ChatGPT
  const sendMessage = async () => {
    if (!transcript.trim()) return;
    
    try {
      setIsProcessing(true);
      
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
      
      if (selectedLesson) {
        const lesson = assignedLessons.find(l => l.id === selectedLesson);
        if (lesson) {
          assignmentId = lesson.id;
          lessonId = lesson.lesson_id;
          
          try {
            // Extrair tópicos e vocabulário
            let lessonContent = lesson.lesson.content;
            if (typeof lessonContent === 'string') {
              lessonContent = JSON.parse(lessonContent);
            }
            
            if (lessonContent.topics && Array.isArray(lessonContent.topics)) {
              lessonTopics = lessonContent.topics;
            }
            
            if (lessonContent.vocabulary && Array.isArray(lessonContent.vocabulary)) {
              vocabularyItems = lessonContent.vocabulary.map((v: any) => 
                typeof v === 'string' ? v : v.term
              );
            }
          } catch (err) {
            console.error('Erro ao processar conteúdo da lição:', err);
          }
        }
      }
      
      // Chamar a função do Supabase para processar a conversa
      const { data: authData } = await supabase.auth.getUser();
      const userId = authData?.user?.id;
      
      if (!userId) {
        toast.error('Usuário não autenticado');
        setIsProcessing(false);
        return;
      }
      
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
        }
      });
      
      if (error) {
        console.error('Erro na função de voz:', error);
        toast.error('Erro ao processar a conversa');
        setIsProcessing(false);
        return;
      }
      
      // Atualizar o ID da conversa
      if (data.conversationId) {
        setConversationId(data.conversationId);
        
        // Se for a primeira mensagem, criar uma sessão de prática
        if (!conversationId && selectedLesson) {
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
      console.error('Erro ao enviar mensagem:', error);
      toast.error('Erro ao enviar mensagem');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Conversa em Inglês</CardTitle>
        <div className="mt-2">
          <Label htmlFor="lesson-select">Selecione uma lição</Label>
          <Select
            value={selectedLesson || ''}
            onValueChange={(value) => {
              setSelectedLesson(value);
              startNewConversation();
            }}
          >
            <SelectTrigger id="lesson-select">
              <SelectValue placeholder="Selecione uma lição" />
            </SelectTrigger>
            <SelectContent>
              {assignedLessons.map((lesson) => (
                <SelectItem key={lesson.id} value={lesson.id}>
                  {lesson.lesson.title}
                </SelectItem>
              ))}
              <SelectItem value="free-practice">Prática livre</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Frases-chave */}
        {keyPhrases.length > 0 && (
          <div className="mb-4">
            <Label>Frases-chave para praticar:</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {keyPhrases.map((phrase, index) => (
                <Badge key={index} variant="secondary">{phrase}</Badge>
              ))}
            </div>
          </div>
        )}
        
        {/* Área de conversa */}
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2 ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  <p>{message.content}</p>
                </div>
              </div>
            ))}
            <div ref={messageEndRef} />
          </div>
        </ScrollArea>
        
        {/* Área de transcrição */}
        <div className="relative mt-4">
          <div
            className={`min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ${
              isListening ? 'border-primary' : ''
            }`}
          >
            {transcript || (
              <span className="text-muted-foreground">
                {isListening
                  ? 'Escutando... Fale em inglês'
                  : 'Clique no microfone para começar a falar em inglês'}
              </span>
            )}
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <Button
          variant={isListening ? 'destructive' : 'outline'}
          onClick={isListening ? stopListening : startListening}
          disabled={isProcessing}
        >
          {isListening ? (
            <>
              <MicOff className="mr-2 h-4 w-4" /> Parar
            </>
          ) : (
            <>
              <Mic className="mr-2 h-4 w-4" /> Gravar
            </>
          )}
        </Button>
        
        <Button 
          onClick={sendMessage}
          disabled={!transcript.trim() || isProcessing}
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processando
            </>
          ) : (
            <>
              <Send className="mr-2 h-4 w-4" /> Enviar
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

// Adicionar definições do SpeechRecognition para TypeScript
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}

export default VoiceChatComponent; 