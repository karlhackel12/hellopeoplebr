
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
        toast.error(`Connection failed. Retrying in ${retryDelay/1000} seconds...`);
        
        const timeoutId = window.setTimeout(() => {
          setConnectionRetries(prev => prev + 1);
          connectToVoiceService();
        }, retryDelay);
        
        setRetryTimeoutId(timeoutId);
      } else {
        toast.error("Failed to connect to voice service after multiple attempts. Please try again later.");
      }
    }
  }, [connect, connectionRetries, retryTimeoutId]);

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
        toast.error('Failed to load session details');
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
      toast.error(`Connection error: ${connectionError}`);
    }
  }, [connectionError, isConnected]);

  const handleCompleteSession = () => {
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
    handleCompleteSession,
    toggleRecording,
    handleBackClick,
    handleExitConfirm,
    toggleLessonView,
  };
};
