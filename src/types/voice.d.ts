// Tipos para o reconhecimento de voz
declare interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
  interpretation: any;
}

declare interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

declare interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

declare interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

declare class SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  onresult: (event: SpeechRecognitionEvent) => void;
  onend: () => void;
  onerror: (event: Event) => void;
  onstart: () => void;
  start(): void;
  stop(): void;
  abort(): void;
}

declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}

// Tipos para conversas e sessões
export interface ConversationMessage {
  id?: string;
  role: 'assistant' | 'user';
  content: string;
  timestamp?: Date;
  conversation_id?: string;
}

export interface VoicePracticeSession {
  id: string;
  lesson_id: string | null;
  topic: string;
  difficulty_level: number;
  started_at: string;
  completed_at: string | null;
  duration_seconds: number | null;
  vocabulary_used: string[] | null;
  analytics_data?: any;
  lesson?: {
    id: string;
    title: string;
    content: any;
  };
}

export interface VoicePracticeFeedback {
  id: string;
  session_id: string;
  feedback_text: string;
  pronunciation_score: number | null;
  grammar_score: number | null;
  fluency_score: number | null;
  created_at: string;
  user_id: string;
}

export interface VoiceConfidenceScore {
  id: string;
  overall_score: number;
  pronunciation_score: number;
  grammar_score: number;
  fluency_score: number;
  recorded_at: string;
} 