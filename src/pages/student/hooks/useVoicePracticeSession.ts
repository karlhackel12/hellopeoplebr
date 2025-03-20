
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useRealtimeVoiceChat } from '@/hooks/useRealtimeVoiceChat';
import { useLesson } from './lesson/useLesson';
import { toast } from 'sonner';

export const useVoicePracticeSession = (sessionId: string | undefined) => {
  const navigate = useNavigate();
  const [sessionDetails, setSessionDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isComplete, setIsComplete] = useState(false);
  const [exitDialogOpen, setExitDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('conversation');
  const [connectionRetries, setConnectionRetries] = useState(0);
  const [retryTimeoutId, setRetryTimeoutId] = useState<number | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const { data: lessonData, isLoading: lessonLoading } = useLesson(
    sessionDetails?.lesson_id || undefined
  );

  const {
    isConnected,
    isRecording,
    isSpeaking,
    audioLevel,
    transcript,
    messages,
    connectionError,
    connect,
    disconnect,
    startRecording,
    stopRecording
  } = useRealtimeVoiceChat();

  const connectToVoiceService = useCallback(async () => {
    if (isConnecting) return;
    
    setIsConnecting(true);
    try {
      console.log('Attempting to connect to voice service...');
      await connect();
      setConnectionRetries(0);
      
      // Clear any existing retry timeout
      if (retryTimeoutId !== null) {
        clearTimeout(retryTimeoutId);
        setRetryTimeoutId(null);
      }
    } catch (error) {
      console.error("Error connecting to voice service:", error);
      
      if (connectionRetries < 3) {
        // Retry connection with exponential backoff
        const retryDelay = Math.min(1000 * Math.pow(2, connectionRetries), 8000);
        toast.error(`Falha na conexão. Tentando novamente em ${retryDelay/1000} segundos...`);
        
        const timeoutId = window.setTimeout(() => {
          setConnectionRetries(prev => prev + 1);
          setIsConnecting(false);
          connectToVoiceService();
        }, retryDelay);
        
        setRetryTimeoutId(timeoutId);
      } else {
        toast.error("Falha ao conectar após várias tentativas. Por favor, tente novamente mais tarde.");
      }
    } finally {
      setIsConnecting(false);
    }
  }, [connect, connectionRetries, retryTimeoutId, isConnecting]);

  useEffect(() => {
    if (!sessionId) return;
    
    const fetchSessionDetails = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('voice_practice_sessions')
          .select(`
            id,
            topic,
            difficulty_level,
            started_at,
            completed_at,
            vocabulary_used,
            lesson_id,
            assignment_id,
            lesson:lessons(id, title, content)
          `)
          .eq('id', sessionId)
          .single();
        
        if (error) {
          console.error('Error fetching session details:', error);
          throw error;
        }
        
        console.log('Fetched session details:', data);
        setSessionDetails(data);
        
        if (data.completed_at) {
          setIsComplete(true);
        } else {
          connectToVoiceService();
        }
      } catch (error) {
        console.error('Error fetching session details:', error);
        toast.error('Falha ao carregar detalhes da sessão');
      } finally {
        setLoading(false);
      }
    };
    
    fetchSessionDetails();
    
    return () => {
      disconnect();
      
      // Clear any retry timeout
      if (retryTimeoutId !== null) {
        clearTimeout(retryTimeoutId);
      }
    };
  }, [sessionId, disconnect, connectToVoiceService, retryTimeoutId]);

  useEffect(() => {
    // Check if we need to display connection error to the user
    if (connectionError && !isConnected) {
      toast.error(`Erro de conexão: ${connectionError}`);
    }
  }, [connectionError, isConnected]);

  const handleCompleteSession = async () => {
    if (!isComplete && sessionId) {
      try {
        // Calculate session duration (in seconds)
        let durationSeconds = 0;
        if (sessionDetails?.started_at) {
          const startTime = new Date(sessionDetails.started_at).getTime();
          const endTime = new Date().getTime();
          durationSeconds = Math.floor((endTime - startTime) / 1000);
        }
        
        await supabase
          .from('voice_practice_sessions')
          .update({
            completed_at: new Date().toISOString(),
            duration_seconds: durationSeconds
          })
          .eq('id', sessionId);
        
        toast.success('Sessão de prática completa!');
      } catch (error) {
        console.error('Error completing session:', error);
        toast.error('Falha ao completar a sessão');
      }
    }
    navigate('/student/voice-practice');
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const handleBackClick = () => {
    if (!isComplete && messages.length > 1) {
      setExitDialogOpen(true);
    } else {
      navigate('/student/voice-practice');
    }
  };

  const handleExitConfirm = () => {
    setExitDialogOpen(false);
    navigate('/student/voice-practice');
  };

  const toggleLessonView = () => {
    setActiveTab(activeTab === 'lesson' ? 'conversation' : 'lesson');
  };

  return {
    sessionDetails,
    loading,
    isComplete,
    exitDialogOpen,
    setExitDialogOpen,
    activeTab,
    setActiveTab,
    lessonData,
    lessonLoading,
    isRecording,
    isSpeaking,
    audioLevel,
    transcript,
    messages,
    connectionError,
    isConnecting,
    handleCompleteSession,
    toggleRecording,
    handleBackClick,
    handleExitConfirm,
    toggleLessonView,
  };
};
