
import { GeneratedLessonContent } from '../types';

export interface GenerationParams {
  timestamp: string;
  title: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  language: string;
  instructions?: string; // Make sure this is explicitly defined as string or undefined
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
  generationId?: string;
  pollingInterval: number;
  pollCount: number;
  maxPollCount: number;
  lastPollTime?: number;
}
