
import { WebSocketService } from './websocketService';
import { AudioQueue } from '@/utils/audioProcessing';
import { Message } from './types';
import { toast } from 'sonner';

export class MessageHandlers {
  private messagesGetter: () => Message[];
  
  constructor(
    private webSocketService: WebSocketService,
    private audioQueue: AudioQueue,
    private updateSpeakingState: (isSpeaking: boolean) => void,
    private updateTranscript: (updater: (prev: string) => string) => void,
    private finalizeTranscript: () => void,
    private addMessage: (message: Message) => void,
    private updateMessages: (messages: Message[]) => void,
    private debugLog: (...args: any[]) => void
  ) {
    // Default implementation that will be overridden
    this.messagesGetter = () => [];
  }
  
  // Method to set the message getter function
  setMessagesGetter(getter: () => Message[]): void {
    this.messagesGetter = getter;
  }

  setupMessageHandlers(): void {
    this.webSocketService.addMessageHandler((data) => {
      this.debugLog("Received message:", data.type);
      
      switch (data.type) {
        case 'session.connected':
          this.initializeSession();
          break;
          
        case 'response.audio.delta':
          this.handleAudioDelta(data);
          break;
          
        case 'response.audio.done':
          this.updateSpeakingState(false);
          break;
          
        case 'response.audio_transcript.delta':
          if (data.delta) {
            this.updateTranscript(prev => prev + data.delta);
          }
          break;
          
        case 'response.audio_transcript.done':
          this.finalizeTranscript();
          break;
          
        case 'response.text.delta':
          this.handleTextDelta(data.delta);
          break;
          
        case 'error':
          console.error('WebSocket error:', data.message);
          toast.error('Erro na conversação: ' + data.message);
          break;
          
        case 'session.disconnected':
          this.handleDisconnect(data);
          break;
      }
    });
  }

  private handleDisconnect(data: any): void {
    this.debugLog("Session disconnected:", data);
    
    // Only show toast if it's not a normal closure
    if (data.code !== 1000) {
      toast.error('Sessão encerrada pelo servidor: ' + (data.reason || 'Erro desconhecido'));
    }
  }

  private handleAudioDelta(data: any): void {
    if (data.delta) {
      try {
        const audioData = Uint8Array.from(atob(data.delta), c => c.charCodeAt(0));
        this.audioQueue.addToQueue(audioData);
        this.updateSpeakingState(true);
      } catch (error) {
        console.error('Error processing audio delta:', error);
      }
    }
  }

  private handleTextDelta(delta: string | undefined): void {
    if (!delta) return;
    
    // Use the getter to get the current messages
    const messages = this.messagesGetter();
    const lastMessage = messages.length > 0 ? messages[messages.length - 1] : null;
    
    if (lastMessage && lastMessage.role === 'assistant') {
      // Update last assistant message
      this.updateMessages([
        ...messages.slice(0, -1),
        { ...lastMessage, content: lastMessage.content + delta }
      ]);
    } else {
      // Create new assistant message
      this.addMessage({
        role: 'assistant',
        content: delta,
        timestamp: new Date()
      });
    }
  }

  initializeSession(): void {
    this.debugLog('Session initialized');
    
    // Send session configuration
    this.webSocketService.send({
      type: 'session.update',
      session: {
        modalities: ['text', 'audio'],
        instructions: 'You are a helpful AI assistant engaging in natural conversation to help users practice English. Be patient, encouraging, and provide clear and concise responses. If the user makes a language mistake, gently correct it.',
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
    });
    
    // Initialize with a welcome message
    this.updateMessages([{
      role: 'assistant',
      content: 'Hello! I\'m your voice assistant for English practice. How can I help you today?',
      timestamp: new Date()
    }]);
  }
}
