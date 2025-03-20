
import { WebSocketService } from './websocketService';
import { AudioQueue } from '@/utils/audioProcessing';
import { Message, VoiceChatStateUpdate } from './types';
import { MessageHandlers } from './messageHandlers';
import { RecorderManager } from './recorderManager';

export class VoiceChatState {
  private messages: Message[] = [];
  private isRecording = false;
  private isSpeaking = false;
  private audioLevel = 0;
  private transcript = '';
  private audioQueue: AudioQueue;
  private isDebugMode = false;
  private messageHandlers: MessageHandlers;
  private recorderManager: RecorderManager;
  
  constructor(
    private webSocketService: WebSocketService,
    private onStateChange: (state: VoiceChatStateUpdate) => void,
    debug = false
  ) {
    this.isDebugMode = debug;
    this.audioQueue = new AudioQueue();
    
    this.messageHandlers = new MessageHandlers(
      webSocketService,
      this.audioQueue,
      this.updateSpeakingState.bind(this),
      this.updateTranscript.bind(this),
      this.finalizeTranscript.bind(this),
      this.addMessage.bind(this),
      this.updateMessages.bind(this),
      this.debugLog.bind(this)
    );
    
    // Set the message getter function
    this.messageHandlers.setMessagesGetter(this.getMessages.bind(this));
    
    this.recorderManager = new RecorderManager(
      webSocketService,
      this.audioQueue.encodeAudioData.bind(this.audioQueue),
      this.debugLog.bind(this),
      this.updateIsRecording.bind(this)
    );
    
    this.setupMessageHandlers();
  }
  
  private debugLog(...args: any[]) {
    if (this.isDebugMode) {
      console.log('[VoiceChatState]', ...args);
    }
  }
  
  private setupMessageHandlers(): void {
    this.messageHandlers.setupMessageHandlers();
  }
  
  private updateIsRecording(isRecording: boolean): void {
    this.isRecording = isRecording;
    this.notifyStateChange();
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
    this.recorderManager.startRecording();
  }
  
  public stopRecording(): void {
    this.recorderManager.stopRecording();
  }
  
  public cleanup(): void {
    this.debugLog('Cleaning up VoiceChatState');
    this.recorderManager.cleanup();
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

  getMessages(): Message[] {
    return this.messages;
  }
}

// Fix the re-export by using 'export type'
export type { Message, VoiceChatStateUpdate } from './types';
