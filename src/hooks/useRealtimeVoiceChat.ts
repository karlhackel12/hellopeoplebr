
import { useState, useEffect, useRef } from 'react';
import { WebSocketService } from '@/services/voiceChat/websocketService';
import { VoiceChatState, Message, VoiceChatStateUpdate } from '@/services/voiceChat/voiceChatState';
import { toast } from 'sonner';

export const useRealtimeVoiceChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [transcript, setTranscript] = useState('');
  const [connectionError, setConnectionError] = useState<string | null>(null);
  
  const webSocketServiceRef = useRef<WebSocketService | null>(null);
  const voiceChatStateRef = useRef<VoiceChatState | null>(null);
  
  const handleStateUpdate = (state: VoiceChatStateUpdate) => {
    setMessages(state.messages);
    setIsRecording(state.isRecording);
    setIsSpeaking(state.isSpeaking);
    setAudioLevel(state.audioLevel);
    setTranscript(state.transcript);
  };
  
  const connect = async () => {
    try {
      console.log('Connecting to voice service...');
      setConnectionError(null);
      
      // Get the project reference from environment
      const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_REF;
      console.log('Using project ref:', projectRef);
      
      if (!projectRef) {
        throw new Error('VITE_SUPABASE_PROJECT_REF is not defined');
      }
      
      // Use the correct WebSocket URL format
      const wsUrl = `wss://${projectRef}.functions.supabase.co/v1/realtime-voice`;
      console.log('Connecting to WebSocket URL:', wsUrl);
      
      if (!webSocketServiceRef.current) {
        webSocketServiceRef.current = new WebSocketService(wsUrl);
      }
      
      if (!voiceChatStateRef.current) {
        voiceChatStateRef.current = new VoiceChatState(
          webSocketServiceRef.current, 
          handleStateUpdate
        );
      }
      
      await webSocketServiceRef.current.connect();
      setIsConnected(true);
      
      // Initialize session
      webSocketServiceRef.current.send({
        type: 'session.initialize'
      });
      
    } catch (error) {
      console.error('Error connecting:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setConnectionError(errorMessage);
      toast.error('Failed to connect to voice service: ' + errorMessage);
      throw error;
    }
  };

  const startRecording = async () => {
    if (!isConnected) {
      await connect();
    }
    
    voiceChatStateRef.current?.startRecording();
  };

  const stopRecording = () => {
    voiceChatStateRef.current?.stopRecording();
  };

  const disconnect = () => {
    stopRecording();
    webSocketServiceRef.current?.close();
    setIsConnected(false);
  };
  
  useEffect(() => {
    return () => {
      voiceChatStateRef.current?.cleanup();
      webSocketServiceRef.current?.close();
    };
  }, []);

  return {
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
  };
};
