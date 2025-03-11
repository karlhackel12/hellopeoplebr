
import { GeneratedLessonContent } from '../types';

export interface GenerationParams {
  timestamp: string;
  title: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  language: string;
  instructions?: string;
}

export interface PredictionResponse {
  id: string;
  status: 'pending' | 'processing' | 'succeeded' | 'failed';
  output?: any;
  urls?: {
    get: string;
    cancel: string;
  };
}

export interface GenerationState {
  generating: boolean;
  generatedContent: GeneratedLessonContent | null;
  level: 'beginner' | 'intermediate' | 'advanced';
  instructions: string;
  error: string | null;
  retryCount: number;
  generationId?: string; 
  pollingInterval: number;
  lastPollTime?: number;
  pollCount: number;
  maxPollCount: number;
  generationStatus: 'idle' | 'pending' | 'processing' | 'completed' | 'failed';
  isCancelled: boolean;
}
