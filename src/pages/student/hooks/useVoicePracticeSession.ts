
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
  const [debugMode, setDebugMode] = useState(false);

  const { data: lessonData, isLoading: lessonLoading } = useLesson(
    sessionDetails?.lesson_id || undefined
  );

  const {
    isConnected,
    isConnecting,
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
  } = useRealtimeVoiceChat({ debug: debugMode });

  const debugLog = useCallback((...args: any[]) => {
    if (debugMode) {
      console.log('[useVoicePracticeSession]', ...args);
    }
  }, [debugMode]);

  // Enable debug mode with keyboard shortcut (Ctrl+Alt+D)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.altKey && e.key === 'd') {
        setDebugMode(prev => {
          const newValue = !prev;
          toast.success(newValue ? 'Modo debug ativado' : 'Modo debug desativado');
          return newValue;
        });
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const connectToVoiceService = useCallback(async () => {
    if (isConnecting || isConnected) {
      debugLog('Already connecting or connected, skipping connect');
      return;
    }
    
    try {
      debugLog('Attempting to connect to voice service...');
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
        toast.error(`Falha na conexão. Tentando novamente em ${Math.round(retryDelay/1000)} segundos...`);
        
        const timeoutId = window.setTimeout(() => {
          setConnectionRetries(prev => prev + 1);
          connectToVoiceService();
        }, retryDelay);
        
        setRetryTimeoutId(timeoutId);
      } else {
        toast.error("Falha ao conectar após várias tentativas. Por favor, tente novamente mais tarde.");
      }
    }
  }, [connect, connectionRetries, retryTimeoutId, isConnecting, isConnected, debugLog]);

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
        
        debugLog('Fetched session details:', data);
        setSessionDetails(data);
        
        if (data.completed_at) {
          setIsComplete(true);
        } else {
          // Don't auto-connect if already completed
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
      debugLog('Cleaning up session...');
      disconnect();
      
      // Clear any retry timeout
      if (retryTimeoutId !== null) {
        clearTimeout(retryTimeoutId);
      }
    };
  }, [sessionId, disconnect, connectToVoiceService, retryTimeoutId, debugLog]);

  useEffect(() => {
    // Check if we need to display connection error to the user
    if (connectionError && !isConnected && !isConnecting) {
      debugLog('Connection error:', connectionError);
      // Don't show toast here as it's already handled in the hook
    }
  }, [connectionError, isConnected, isConnecting, debugLog]);

  const handleCompleteSession = async () => {
    if (!isComplete && sessionId) {
      try {
        debugLog('Completing session...');
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
        
        setIsComplete(true);
        toast.success('Sessão de prática completa!');
      } catch (error) {
        console.error('Error completing session:', error);
        toast.error('Falha ao completar a sessão');
      }
    }
    
    debugLog('Navigating back to voice practice menu...');
    disconnect();
    navigate('/student/voice-practice');
  };

  const toggleRecording = useCallback(() => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  }, [isRecording, startRecording, stopRecording]);

  const handleBackClick = useCallback(() => {
    if (!isComplete && messages.length > 1) {
      setExitDialogOpen(true);
    } else {
      disconnect();
      navigate('/student/voice-practice');
    }
  }, [isComplete, messages, disconnect, navigate]);

  const handleExitConfirm = useCallback(() => {
    setExitDialogOpen(false);
    disconnect();
    navigate('/student/voice-practice');
  }, [disconnect, navigate]);

  const toggleLessonView = useCallback(() => {
    setActiveTab(activeTab === 'lesson' ? 'conversation' : 'lesson');
  }, [activeTab]);

  // Retry connection if needed when error changes
  useEffect(() => {
    if (connectionError && !isConnected && !isConnecting && connectionRetries === 0) {
      debugLog('Trying to reconnect after connection error...');
      const timeoutId = window.setTimeout(() => {
        connectToVoiceService();
      }, 3000);
      
      setRetryTimeoutId(timeoutId);
      setConnectionRetries(1);
      
      return () => {
        if (timeoutId) clearTimeout(timeoutId);
      };
    }
  }, [connectionError, isConnected, isConnecting, connectionRetries, connectToVoiceService, debugLog]);

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
