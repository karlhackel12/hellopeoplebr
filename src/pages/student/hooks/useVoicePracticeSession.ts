
import { useState, useEffect } from 'react';
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
    connect,
    disconnect,
    startRecording,
    stopRecording
  } = useRealtimeVoiceChat();

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
        
        if (error) throw error;
        setSessionDetails(data);
        
        if (!data.completed_at) {
          try {
            await connect();
          } catch (connectError) {
            console.error("Error connecting to voice service:", connectError);
            toast.error("Failed to connect to voice service. Please try again.");
          }
        } else {
          setIsComplete(true);
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
    };
  }, [sessionId, connect, disconnect]);

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
    handleCompleteSession,
    toggleRecording,
    handleBackClick,
    handleExitConfirm,
    toggleLessonView,
  };
};
