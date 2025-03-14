
import { GenerationPhase } from '../types';
import { getPhaseStatusMessage } from './generationStateConstants';

// Helper function to calculate poll progress (25% to 90%)
export const calculatePollProgress = (pollCount: number, maxPollCount: number): number => {
  return Math.min(25 + (pollCount / maxPollCount) * 65, 90);
};

// Helper function to determine the generation phase based on status
export const determinePhaseFromStatus = (status: string): GenerationPhase => {
  switch (status) {
    case 'pending':
      return 'starting';
    case 'processing':
      return 'generating';
    case 'completed':
      return 'complete';
    case 'failed':
      return 'error';
    default:
      return 'idle';
  }
};

// Helper function to get status message based on phase
export const getStatusMessageForPhase = (phase: GenerationPhase): string => {
  return getPhaseStatusMessage(phase);
};
