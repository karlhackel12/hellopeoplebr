
import { WebSocketService } from './websocketService';
import { AudioRecorder, AudioQueue } from '@/utils/audioProcessing';
import { toast } from 'sonner';

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface VoiceChatStateUpdate {
  messages: Message[];
  isRecording: boolean;
  isSpeaking: boolean;
  audioLevel: number;
  transcript: string;
}

export class VoiceChatState {
  private messages: Message[] = [];
  private isRecording = false;
  private isSpeaking = false;
  private audioLevel = 0;
  private transcript = '';
  private recorder: AudioRecorder | null = null;
  private audioQueue: AudioQueue;
  private isDebugMode = false;
  
  constructor(
    private webSocketService: WebSocketService,
    private onStateChange: (state: VoiceChatStateUpdate) => void,
    debug = false
  ) {
    this.isDebugMode = debug;
    this.audioQueue = new AudioQueue();
    this.setupMessageHandlers();
  }
  
  private debugLog(...args: any[]) {
    if (this.isDebugMode) {
      console.log('[VoiceChatState]', ...args);
    }
  }
  
  private setupMessageHandlers(): void {
    this.webSocketService.addMessageHandler((data) => {
      this.debugLog("Received message:", data.type);
      
      switch (data.type) {
        case 'session.connected':
          this.initializeSession();
          break;
          
        case 'response.audio.delta':
          if (data.delta) {
            try {
              const audioData = Uint8Array.from(atob(data.delta), c => c.charCodeAt(0));
              this.audioQueue.addToQueue(audioData);
              this.updateSpeakingState(true);
            } catch (error) {
              console.error('Error processing audio delta:', error);
            }
          }
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
    
    // Stop recording if active
    if (this.isRecording) {
      this.stopRecording();
    }
  }
  
  private updateSpeakingState(isSpeaking: boolean): void {
    this.isSpeaking = isSpeaking;
    this.notifyStateChange();
  }
  
  private updateTranscript(updater: (prev: string) => string): void {
    this.transcript = updater(this.transcript);
    this.notifyStateChange();
  }
  
  private finalizeTranscript(): void {
    if (this.transcript) {
      this.addMessage({
        role: 'user',
        content: this.transcript,
        timestamp: new Date()
      });
      this.transcript = '';
      this.notifyStateChange();
    }
  }
  
  private handleTextDelta(delta: string | undefined): void {
    if (!delta) return;
    
    const lastMessage = this.messages[this.messages.length - 1];
    
    if (lastMessage && lastMessage.role === 'assistant') {
      // Update last assistant message
      this.updateMessages([
        ...this.messages.slice(0, -1),
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
  
  private initializeSession(): void {
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
  
  private updateMessages(messages: Message[]): void {
    this.messages = messages;
    this.notifyStateChange();
  }
  
  private addMessage(message: Message): void {
    this.messages = [...this.messages, message];
    this.notifyStateChange();
  }
  
  private notifyStateChange(): void {
    this.onStateChange({
      messages: this.messages,
      isRecording: this.isRecording,
      isSpeaking: this.isSpeaking,
      audioLevel: this.audioLevel,
      transcript: this.transcript
    });
  }
  
  public startRecording(): void {
    if (this.isRecording) return;
    
    try {
      this.debugLog('Starting audio recorder');
      this.recorder = new AudioRecorder((audioData) => {
        if (this.webSocketService.isConnected()) {
          try {
            const base64Audio = this.audioQueue.encodeAudioData(audioData);
            if (base64Audio) {
              this.webSocketService.send({
                type: 'input_audio_buffer.append',
                audio: base64Audio
              });
            }
          } catch (error) {
            console.error('Error encoding or sending audio data:', error);
          }
        }
      });
      
      this.recorder.start()
        .then(() => {
          this.isRecording = true;
          this.notifyStateChange();
        })
        .catch(error => {
          console.error('Error starting recording:', error);
          toast.error('Falha ao iniciar gravação: ' + (error instanceof Error ? error.message : 'Erro desconhecido'));
        });
    } catch (error) {
      console.error('Error creating recorder:', error);
      toast.error('Falha ao acessar microfone');
    }
  }
  
  public stopRecording(): void {
    if (this.recorder) {
      this.debugLog('Stopping audio recorder');
      this.recorder.stop();
      this.recorder = null;
      this.isRecording = false;
      this.notifyStateChange();
    }
  }
  
  public cleanup(): void {
    this.debugLog('Cleaning up VoiceChatState');
    this.stopRecording();
    this.audioQueue.stop();
  }
  
  public getState(): VoiceChatStateUpdate {
    return {
      messages: this.messages,
      isRecording: this.isRecording,
      isSpeaking: this.isSpeaking,
      audioLevel: this.audioLevel,
      transcript: this.transcript
    };
  }
}
