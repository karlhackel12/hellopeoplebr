
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
