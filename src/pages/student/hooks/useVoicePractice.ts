import { useState, useEffect, useCallback, useRef } from 'react';
import useVoiceRecorder from './useVoiceRecorder';
import openAIVoiceService from '@/integrations/openai/voiceService';
import * as dotenv from 'dotenv';

// Carrega variáveis de ambiente
dotenv.config();

// Verifica se estamos usando o modo de simulação
const USE_SIMULATION = process.env.USE_SIMULATION === 'true' || false;

// Tipos para mensagens
export type MessageRole = 'user' | 'assistant' | 'system';

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
}

interface UseVoicePracticeProps {
  category?: string;
  onError?: (error: Error) => void;
  simulationMode?: boolean; // Modo de simulação para testes sem servidor gRPC
}

interface UseVoicePracticeReturn {
  messages: Message[];
  isRecording: boolean;
  isProcessing: boolean;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  speakMessage: (messageId: string) => Promise<void>;
  clearConversation: () => void;
  error: Error | null;
  isStreaming: boolean;
}

/**
 * Hook para gerenciar a interação de prática de voz com a OpenAI
 */
export const useVoicePractice = ({
  category = 'general',
  onError,
  simulationMode = USE_SIMULATION // Usar configuração do ambiente por padrão
}: UseVoicePracticeProps = {}): UseVoicePracticeReturn => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Olá! Estou aqui para ajudar com sua prática de pronúncia em inglês. Como posso auxiliar hoje?',
      timestamp: new Date()
    }
  ]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const streamRef = useRef<any>(null);
  
  // Inicializa o elemento de áudio
  useEffect(() => {
    audioRef.current = new Audio();
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Lidar com a finalização do streaming ao desmontar
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.stopStream();
        streamRef.current = null;
      }
    };
  }, []);
  
  // Gera uma resposta simulada com base na categoria
  const generateSimulatedResponse = (userText: string): string => {
    switch(category) {
      case 'pronunciation':
        return "Great! Let's practice pronunciation of challenging words. Here are some words many English learners find difficult: 'thoroughly', 'specifically', 'phenomenon', 'entrepreneur'. Try repeating each word after me.";
      case 'conversation':
        return "I'd love to discuss your hobbies! What kinds of activities do you enjoy in your free time? Do you prefer outdoor activities, creative pursuits, or perhaps something else?";
      case 'listening':
        return "I can help with your listening skills. I'll speak at a natural pace about different topics, and you can try to understand and respond. Let's start with a simple topic: What did you do last weekend?";
      default:
        return `That's a great question! ${userText.endsWith('?') ? 'I think' : 'Could you tell me more about'} what specific aspect of English speaking you'd like to focus on today?`;
    }
  };
  
  // Processa o áudio no modo de simulação
  const processAudioInSimulationMode = async (blob: Blob) => {
    setIsProcessing(true);
    
    try {
      // Simular um pequeno atraso para transcrição
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Gerar uma transcrição simulada com base na categoria
      let transcribedText = '';
      switch(category) {
        case 'pronunciation':
          transcribedText = "I'd like to practice my pronunciation of difficult words in English.";
          break;
        case 'conversation':
          transcribedText = "Can we have a conversation about my favorite hobbies?";
          break;
        case 'listening':
          transcribedText = "I want to improve my listening comprehension skills.";
          break;
        default:
          transcribedText = "I want to practice my English speaking skills.";
      }
      
      // Adicionar mensagem do usuário
      const userMessage: Message = {
        id: Date.now().toString(),
        role: 'user',
        content: transcribedText,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, userMessage]);
      
      // Simular um pequeno atraso para a resposta
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Gerar resposta simulada
      const assistantResponse = generateSimulatedResponse(transcribedText);
      
      // Adicionar resposta do assistente
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: assistantResponse,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      
    } catch (err) {
      const processingError = err instanceof Error ? err : new Error('Erro ao processar áudio em modo de simulação');
      setError(processingError);
      
      if (onError) {
        onError(processingError);
      }
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Processa o áudio usando o serviço gRPC
  const processAudioWithGrpc = async (blob: Blob) => {
    try {
      setIsProcessing(true);
      
      // Converter Blob para Uint8Array para enviar para o serviço gRPC
      const arrayBuffer = await blob.arrayBuffer();
      const audioData = new Uint8Array(arrayBuffer);
      
      // Transcrever o áudio
      const transcription = await openAIVoiceService.transcribe({
        audioData,
        language: 'pt', // Ou determinar baseado na categoria
        model: 'whisper-1'
      });
      
      // Adicionar mensagem do usuário
      const userMessage: Message = {
        id: Date.now().toString(),
        role: 'user',
        content: transcription.text,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, userMessage]);
      
      // Construir mensagens para o chat completion
      const chatMessages = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));
      
      // Adicionar a nova mensagem do usuário
      chatMessages.push({
        role: 'user',
        content: transcription.text
      });
      
      // Sistema de prompt baseado na categoria
      let systemPrompt = '';
      switch (category) {
        case 'pronunciation':
          systemPrompt = 'You are an English pronunciation coach helping a student improve their pronunciation. Focus on giving clear guidance on how to pronounce words correctly.';
          break;
        case 'conversation':
          systemPrompt = 'You are an English conversation partner. Engage the student in natural conversation, correct their grammar gently, and encourage them to expand on their thoughts.';
          break;
        case 'listening':
          systemPrompt = 'You are an English listening comprehension coach. Speak clearly, ask questions, and help the student understand spoken English.';
          break;
        default:
          systemPrompt = 'You are an English language tutor helping a student practice their English speaking skills. Be encouraging and helpful.';
      }
      
      // Obter resposta da OpenAI
      const response = await openAIVoiceService.chatCompletion({
        messages: chatMessages,
        systemPrompt,
        model: 'gpt-4'
      });
      
      // Adicionar resposta do assistente
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.text,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      
    } catch (err) {
      const processingError = err instanceof Error ? err : new Error('Erro ao processar áudio');
      setError(processingError);
      
      if (onError) {
        onError(processingError);
      }
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Inicia uma conversa em streaming
  const startStreamingConversation = async (blob: Blob) => {
    try {
      setIsStreaming(true);
      
      // Converter Blob para Uint8Array
      const arrayBuffer = await blob.arrayBuffer();
      const audioData = new Uint8Array(arrayBuffer);
      
      // Manipulador para texto recebido
      const handleTextReceived = (text: string, isFinal: boolean) => {
        if (text.startsWith('Você disse:')) {
          // É uma transcrição do que o usuário disse
          const userText = text.replace('Você disse:', '').trim();
          
          // Adicionar mensagem do usuário (apenas se for a transcrição completa)
          if (!messages.some(m => m.role === 'user' && m.content === userText)) {
            const userMessage: Message = {
              id: Date.now().toString(),
              role: 'user',
              content: userText,
              timestamp: new Date()
            };
            setMessages(prev => [...prev, userMessage]);
          }
        } else if (text === 'Processando sua mensagem...') {
          // Ignorar mensagem de processamento
          return;
        } else {
          // É uma resposta do assistente
          if (isFinal) {
            // Resposta final completa
            const assistantMessage: Message = {
              id: Date.now().toString(),
              role: 'assistant',
              content: text,
              timestamp: new Date()
            };
            setMessages(prev => [...prev, assistantMessage]);
          } else {
            // Atualização parcial - poderia ser implementado um preview em tempo real
            // Omitido para simplificação
          }
        }
      };
      
      // Manipulador para áudio recebido
      const handleAudioReceived = (audio: Uint8Array, isFinal: boolean) => {
        if (isFinal && audioRef.current) {
          const blob = new Blob([audio], { type: 'audio/mp3' });
          const url = URL.createObjectURL(blob);
          audioRef.current.src = url;
          audioRef.current.play().catch(console.error);
        }
      };
      
      // Manipulador de erros
      const handleStreamError = (error: Error) => {
        console.error('Erro no streaming:', error);
        setError(error);
        if (onError) onError(error);
        setIsStreaming(false);
      };
      
      // Iniciar conversa em streaming
      const stream = await openAIVoiceService.startStreamingConversation({
        onTextReceived: handleTextReceived,
        onAudioReceived: handleAudioReceived,
        onError: handleStreamError
      });
      
      // Salvar referência para cleanup
      streamRef.current = stream;
      
      // Enviar o áudio
      stream.sendAudio(audioData, true);
      
    } catch (err) {
      const streamingError = err instanceof Error ? err : new Error('Erro ao iniciar streaming');
      setError(streamingError);
      if (onError) onError(streamingError);
    } finally {
      // O streaming continuará no background, só marcaremos como finalizado
      // quando recebermos a mensagem final ou ocorrer um erro
      setIsProcessing(false);
    }
  };
  
  // Configuração do hook de gravação de voz
  const handleAudioReady = useCallback(async (blob: Blob) => {
    if (simulationMode) {
      await processAudioInSimulationMode(blob);
    } else {
      // Usar streaming para comunicação em tempo real quando possível
      try {
        await startStreamingConversation(blob);
      } catch (error) {
        console.warn('Erro ao usar streaming, voltando para modo padrão:', error);
        await processAudioWithGrpc(blob);
      }
    }
  }, [messages, category, onError, simulationMode]);
  
  const handleRecordingError = useCallback((err: Error) => {
    setError(err);
    if (onError) {
      onError(err);
    }
  }, [onError]);
  
  // Inicializa o gravador de voz
  const {
    isRecording,
    startRecording,
    stopRecording,
    error: recorderError
  } = useVoiceRecorder({
    onAudioReady: handleAudioReady,
    onError: handleRecordingError
  });
  
  // Atualiza o erro se houver um erro do gravador
  useEffect(() => {
    if (recorderError) {
      setError(recorderError);
    }
  }, [recorderError]);
  
  // Função para falar uma mensagem
  const speakMessage = useCallback(async (messageId: string) => {
    try {
      const message = messages.find(msg => msg.id === messageId);
      
      if (!message) {
        throw new Error('Mensagem não encontrada');
      }
      
      if (simulationMode) {
        // No modo de simulação, usar a API de síntese de voz do navegador
        if ('speechSynthesis' in window) {
          const utterance = new SpeechSynthesisUtterance(message.content);
          utterance.lang = 'en-US';
          utterance.rate = 0.9; // Ligeiramente mais lento
          window.speechSynthesis.speak(utterance);
        } else {
          throw new Error('Síntese de fala não suportada pelo navegador');
        }
      } else {
        // Usar o serviço gRPC para Text-to-Speech
        const response = await openAIVoiceService.textToSpeech({
          text: message.content,
          voice: 'nova', // Ou outra voz adequada
          model: 'tts-1'
        });
        
        // Criar um objeto Blob com os dados de áudio
        const blob = new Blob([response.audioData], { type: `audio/${response.format}` });
        const url = URL.createObjectURL(blob);
        
        // Reproduzir o áudio
        if (audioRef.current) {
          audioRef.current.src = url;
          await audioRef.current.play();
        }
      }
    } catch (err) {
      const speakError = err instanceof Error ? err : new Error('Erro ao reproduzir áudio');
      setError(speakError);
      
      if (onError) {
        onError(speakError);
      }
    }
  }, [messages, onError, simulationMode]);
  
  // Limpar a conversa
  const clearConversation = useCallback(() => {
    // Finalizar qualquer streaming ativo
    if (streamRef.current) {
      streamRef.current.stopStream();
      streamRef.current = null;
      setIsStreaming(false);
    }
    
    setMessages([
      {
        id: Date.now().toString(),
        role: 'assistant',
        content: 'Olá! Estou aqui para ajudar com sua prática de pronúncia em inglês. Como posso auxiliar hoje?',
        timestamp: new Date()
      }
    ]);
  }, []);
  
  return {
    messages,
    isRecording,
    isProcessing,
    startRecording,
    stopRecording,
    speakMessage,
    clearConversation,
    error,
    isStreaming
  };
};

export default useVoicePractice; 