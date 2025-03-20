
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
      
      const wsUrl = `wss://${import.meta.env.VITE_SUPABASE_PROJECT_REF}.functions.supabase.co/realtime-voice`;
      
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
      toast.error('Failed to connect to voice service');
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
    connect,
    disconnect,
    startRecording,
    stopRecording
  };
};
