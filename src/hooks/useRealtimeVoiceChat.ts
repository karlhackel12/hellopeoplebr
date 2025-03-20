
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AudioRecorder, AudioQueue } from '@/utils/audioProcessing';
import { toast } from 'sonner';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export const useRealtimeVoiceChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [transcript, setTranscript] = useState('');
  
  const wsRef = useRef<WebSocket | null>(null);
  const recorderRef = useRef<AudioRecorder | null>(null);
  const audioQueueRef = useRef<AudioQueue | null>(null);
  
  useEffect(() => {
    audioQueueRef.current = new AudioQueue();
    return () => {
      audioQueueRef.current?.stop();
      wsRef.current?.close();
      recorderRef.current?.stop();
    };
  }, []);

  const connect = async () => {
    try {
      console.log('Connecting to voice service...');
      
      // Here's the issue - the previous code was trying to use response.data.url
      // but the Edge Function doesn't return a URL, it directly upgrades the connection
      
      // Create WebSocket connection directly to the edge function
      const wsUrl = `wss://${import.meta.env.VITE_SUPABASE_PROJECT_REF}.functions.supabase.co/realtime-voice`;
      console.log('Connecting to WebSocket URL:', wsUrl);
      
      wsRef.current = new WebSocket(wsUrl);
      
      wsRef.current.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        
        // Initialize session
        wsRef.current?.send(JSON.stringify({
          type: 'session.initialize'
        }));
      };
      
      wsRef.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log('Received message:', data.type);
        
        switch (data.type) {
          case 'response.audio.delta':
            if (audioQueueRef.current && data.delta) {
              const audioData = Uint8Array.from(atob(data.delta), c => c.charCodeAt(0));
              audioQueueRef.current.addToQueue(audioData);
              setIsSpeaking(true);
            }
            break;
            
          case 'response.audio.done':
            setIsSpeaking(false);
            break;
            
          case 'response.audio_transcript.delta':
            if (data.delta) {
              setTranscript(prev => prev + data.delta);
            }
            break;
            
          case 'response.audio_transcript.done':
            // Add the transcript as a message
            if (transcript) {
              setMessages(prev => [...prev, {
                role: 'user',
                content: transcript,
                timestamp: new Date()
              }]);
              setTranscript('');
            }
            break;
            
          case 'response.text.delta':
            if (data.delta) {
              // This is the assistant's text response
              const lastMessage = messages[messages.length - 1];
              if (lastMessage && lastMessage.role === 'assistant') {
                // Update last assistant message
                setMessages(prev => [
                  ...prev.slice(0, -1),
                  { ...lastMessage, content: lastMessage.content + data.delta }
                ]);
              } else {
                // Create new assistant message
                setMessages(prev => [...prev, {
                  role: 'assistant',
                  content: data.delta,
                  timestamp: new Date()
                }]);
              }
            }
            break;
            
          case 'session.connected':
            console.log('Session initialized');
            // Send session configuration
            wsRef.current?.send(JSON.stringify({
              type: 'session.update',
              session: {
                modalities: ['text', 'audio'],
                instructions: 'You are a helpful AI assistant engaging in natural conversation. Provide clear and concise responses.',
                voice: 'alloy',
                input_audio_format: 'pcm16',
                output_audio_format: 'pcm16',
                input_audio_transcription: {
                  model: 'whisper-1'
                },
                turn_detection: {
                  type: 'server_vad',
                  threshold: 0.5,
                  prefix_padding_ms: 300,
                  silence_duration_ms: 1000
                }
              }
            }));
            
            // Initialize with a welcome message
            setMessages([{
              role: 'assistant',
              content: 'Hello! I\'m your voice assistant. How can I help you today?',
              timestamp: new Date()
            }]);
            break;
            
          case 'error':
            console.error('WebSocket error:', data.message);
            toast.error('Connection error: ' + data.message);
            break;
        }
      };
      
      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        toast.error('Connection error occurred');
      };
      
      wsRef.current.onclose = () => {
        console.log('WebSocket closed');
        setIsConnected(false);
        setIsRecording(false);
      };
      
    } catch (error) {
      console.error('Error connecting:', error);
      toast.error('Failed to connect to voice service');
    }
  };

  const startRecording = async () => {
    if (!isConnected) {
      await connect();
    }
    
    try {
      recorderRef.current = new AudioRecorder((audioData) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          const base64Audio = audioQueueRef.current?.encodeAudioData(audioData);
          if (base64Audio) {
            wsRef.current.send(JSON.stringify({
              type: 'input_audio_buffer.append',
              audio: base64Audio
            }));
          }
        }
      });
      
      await recorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      toast.error('Failed to start recording');
    }
  };

  const stopRecording = () => {
    recorderRef.current?.stop();
    setIsRecording(false);
  };

  const disconnect = () => {
    stopRecording();
    wsRef.current?.close();
    setIsConnected(false);
  };

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
