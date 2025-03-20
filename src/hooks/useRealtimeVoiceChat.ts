
import { useState, useEffect, useRef, useCallback } from 'react';
import { WebSocketService } from '@/services/voiceChat/websocketService';
import { VoiceChatState, Message, VoiceChatStateUpdate } from '@/services/voiceChat/voiceChatState';
import { toast } from 'sonner';

interface UseRealtimeVoiceChatOptions {
  debug?: boolean;
}

export const useRealtimeVoiceChat = (options: UseRealtimeVoiceChatOptions = {}) => {
  const { debug = false } = options;
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [transcript, setTranscript] = useState('');
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  
  const webSocketServiceRef = useRef<WebSocketService | null>(null);
  const voiceChatStateRef = useRef<VoiceChatState | null>(null);
  
  const handleStateUpdate = (state: VoiceChatStateUpdate) => {
    setMessages(state.messages);
    setIsRecording(state.isRecording);
    setIsSpeaking(state.isSpeaking);
    setAudioLevel(state.audioLevel);
    setTranscript(state.transcript);
  };
  
  const debugLog = useCallback((...args: any[]) => {
    if (debug) {
      console.log('[useRealtimeVoiceChat]', ...args);
    }
  }, [debug]);
  
  const connect = useCallback(async () => {
    if (isConnecting) {
      debugLog('Already connecting, ignoring connect request');
      return;
    }
    
    try {
      setIsConnecting(true);
      setConnectionError(null);
      debugLog('Connecting to voice service...');
      
      // Get the project reference
      const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_REF;
      debugLog('Using project ref:', projectRef);
      
      if (!projectRef) {
        throw new Error('VITE_SUPABASE_PROJECT_REF is not defined');
      }
      
      // Use the correct WebSocket URL format
      const wsUrl = `wss://${projectRef}.supabase.co/functions/v1/realtime-voice`;
      debugLog('Connecting to WebSocket URL:', wsUrl);
      
      if (!webSocketServiceRef.current) {
        webSocketServiceRef.current = new WebSocketService(wsUrl, debug);
      }
      
      await webSocketServiceRef.current.connect();
      
      if (!voiceChatStateRef.current) {
        voiceChatStateRef.current = new VoiceChatState(
          webSocketServiceRef.current, 
          handleStateUpdate
        );
      }
      
      setIsConnected(true);
      
      // Initialize session
      webSocketServiceRef.current.send({
        type: 'session.initialize'
      });
      
    } catch (error) {
      console.error('Error connecting:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setConnectionError(errorMessage);
      toast.error('Falha ao conectar ao serviço de voz: ' + errorMessage);
      throw error;
    } finally {
      setIsConnecting(false);
    }
  }, [debug, debugLog, isConnecting]);

  const startRecording = useCallback(async () => {
    if (!isConnected) {
      debugLog('Not connected, connecting first...');
      try {
        await connect();
      } catch (error) {
        debugLog('Failed to connect before recording:', error);
        return;
      }
    }
    
    debugLog('Starting recording...');
    voiceChatStateRef.current?.startRecording();
  }, [connect, debugLog, isConnected]);

  const stopRecording = useCallback(() => {
    debugLog('Stopping recording...');
    voiceChatStateRef.current?.stopRecording();
  }, [debugLog]);

  const disconnect = useCallback(() => {
    debugLog('Disconnecting...');
    stopRecording();
    voiceChatStateRef.current?.cleanup();
    webSocketServiceRef.current?.close();
    setIsConnected(false);
  }, [debugLog, stopRecording]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      debugLog('Component unmounting, cleaning up...');
      voiceChatStateRef.current?.cleanup();
      webSocketServiceRef.current?.close();
    };
  }, [debugLog]);

  return {
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
  };
};
