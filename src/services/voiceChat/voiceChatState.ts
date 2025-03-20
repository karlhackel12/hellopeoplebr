import { WebSocketService } from './websocketService';
import { AudioRecorder, AudioQueue } from '@/utils/audioProcessing';
import { toast } from 'sonner';

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export class VoiceChatState {
  private messages: Message[] = [];
  private isRecording = false;
  private isSpeaking = false;
  private audioLevel = 0;
  private transcript = '';
  private recorder: AudioRecorder | null = null;
  private audioQueue: AudioQueue;
  
  constructor(
    private webSocketService: WebSocketService,
    private onStateChange: (state: VoiceChatStateUpdate) => void
  ) {
    this.audioQueue = new AudioQueue();
    this.setupMessageHandlers();
  }
  
  private setupMessageHandlers(): void {
    this.webSocketService.addMessageHandler((data) => {
      switch (data.type) {
        case 'response.audio.delta':
          if (data.delta) {
            const audioData = Uint8Array.from(atob(data.delta), c => c.charCodeAt(0));
            this.audioQueue.addToQueue(audioData);
            this.updateSpeakingState(true);
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
          
        case 'session.connected':
          this.initializeSession();
          break;
          
        case 'error':
          console.error('WebSocket error:', data.message);
          toast.error('Connection error: ' + data.message);
          break;
      }
    });
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
    console.log('Session initialized');
    
    // Send session configuration
    this.webSocketService.send({
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
    });
    
    // Initialize with a welcome message
    this.updateMessages([{
      role: 'assistant',
      content: 'Hello! I\'m your voice assistant. How can I help you today?',
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
    
    this.recorder = new AudioRecorder((audioData) => {
      if (this.webSocketService.isConnected()) {
        const base64Audio = this.audioQueue.encodeAudioData(audioData);
        if (base64Audio) {
          this.webSocketService.send({
            type: 'input_audio_buffer.append',
            audio: base64Audio
          });
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
        toast.error('Failed to start recording');
      });
  }
  
  public stopRecording(): void {
    if (this.recorder) {
      this.recorder.stop();
      this.recorder = null;
      this.isRecording = false;
      this.notifyStateChange();
    }
  }
  
  public cleanup(): void {
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

export interface VoiceChatStateUpdate {
  messages: Message[];
  isRecording: boolean;
  isSpeaking: boolean;
  audioLevel: number;
  transcript: string;
}
