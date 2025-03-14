
import { useEffect } from 'react';

/**
 * Hook for handling cleanup of generation resources
 */
export const useGenerationCleanup = (
  generating: boolean,
  cancelGeneration: () => void
) => {
  // Clean up any polling or resources when component unmounts
  useEffect(() => {
    return () => {
      if (generating) {
        cancelGeneration();
      }
    };
  }, [generating, cancelGeneration]);
};
