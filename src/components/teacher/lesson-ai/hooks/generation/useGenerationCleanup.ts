
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
    console.log("Setting up generation cleanup effect");
    
    return () => {
      console.log("Cleaning up generation resources");
      if (generating) {
        console.log("Generation was in progress, canceling");
        cancelGeneration();
      }
    };
  }, [generating, cancelGeneration]);
};
