
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
  status: string;
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
  generationId?: string; // Added to track the generation process
  pollingInterval?: number; // Controls how often we check for updates
  generationStatus: 'idle' | 'pending' | 'processing' | 'completed' | 'failed';
}
