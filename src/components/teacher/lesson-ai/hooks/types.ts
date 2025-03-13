
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
  status: 'succeeded' | 'failed';
  output?: any;
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
  // Add the missing properties that are causing TypeScript errors
  generationId?: string;
  pollingInterval: number;
  pollCount: number;
  maxPollCount: number;
  lastPollTime?: number;
}
