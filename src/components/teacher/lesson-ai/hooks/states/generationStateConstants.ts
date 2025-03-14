
import { GenerationPhase } from '../types';

// Constants for generation state
export const DEFAULT_POLLING_INTERVAL = 3000; // 3 seconds
export const MAX_POLL_COUNT = 40; // Maximum number of polling attempts (2 minutes at 3-second intervals)

// Constants for status messages based on generation phase
export const getPhaseStatusMessage = (phase: GenerationPhase): string => {
  switch (phase) {
    case 'starting':
      return 'Initializing AI lesson generation...';
    case 'analyzing':
      return 'Analyzing topic and requirements...';
    case 'generating':
      return 'Creating lesson content with AI...';
    case 'processing':
      return 'Processing and formatting content...';
    case 'complete':
      return 'Lesson content successfully generated!';
    case 'error':
      return 'There was an error generating content.';
    default:
      return '';
  }
};
