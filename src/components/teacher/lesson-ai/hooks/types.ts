
import { GeneratedLessonContent } from '../types';

export interface GenerationParams {
  timestamp: string;
  title: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  language: string;
  subject?: string;
  instructions?: string;
}

export interface PredictionResponse {
  id?: string;
  status: 'succeeded' | 'failed' | 'pending' | 'processing';
  lesson?: GeneratedLessonContent;
  output?: any;
  error?: string;
}

export type GenerationPhase = 
  | 'idle' 
  | 'starting' 
  | 'analyzing' 
  | 'generating' 
  | 'processing' 
  | 'complete' 
  | 'error';

export interface GenerationState {
  generating: boolean;
  generatedContent: GeneratedLessonContent | null;
  level: 'beginner' | 'intermediate' | 'advanced';
  instructions: string;
  error: string | null;
  retryCount: number;
  generationStatus: 'idle' | 'pending' | 'processing' | 'completed' | 'failed';
  generationPhase: GenerationPhase;
  progressPercentage: number;
  statusMessage: string;
  isCancelled: boolean;
  generationId?: string;
  pollingInterval: number;
  pollCount: number;
  maxPollCount: number;
  lastPollTime?: number;
}
