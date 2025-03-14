
import { GeneratedLessonContent } from '../../types';
import { GenerationPhase } from '../types';

export interface GenerationStateValues {
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

export interface GenerationStateActions {
  setGenerating: (generating: boolean) => void;
  setGeneratedContent: (generatedContent: GeneratedLessonContent | null) => void;
  setLevel: (level: 'beginner' | 'intermediate' | 'advanced') => void;
  setInstructions: (instructions: string) => void;
  setError: (error: string | null) => void;
  incrementRetryCount: () => void;
  resetRetryCount: () => void;
  clearErrors: () => void;
  setGenerationStatus: (status: GenerationStateValues['generationStatus']) => void;
  setGenerationPhase: (phase: GenerationPhase) => void;
  setProgressPercentage: (percentage: number) => void;
  setStatusMessage: (message: string) => void;
  setGenerationId: (id: string | undefined) => void;
  setPollingInterval: (interval: number) => void;
  incrementPollCount: () => void;
  resetPollCount: () => void;
  cancelGeneration: () => void;
  resetGenerationState: () => void;
}

export type GenerationState = GenerationStateValues & GenerationStateActions;
