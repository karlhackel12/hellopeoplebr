
import { useEffect, useState } from 'react';

/**
 * Hook for handling generation settings synchronization
 */
export const useGenerationSettings = (
  title: string,
  level: 'beginner' | 'intermediate' | 'advanced',
  instructions: string,
  handleSettingsChange: (settings: any) => void
) => {
  const [lastTitleUsed, setLastTitleUsed] = useState<string>('');
  
  // Synchronize the title with the generation handler whenever it changes
  useEffect(() => {
    if (title && title !== lastTitleUsed) {
      console.log('Title changed, updating generation settings:', title);
      // Generate a timestamp when updating title
      const timestamp = new Date().toISOString();
      
      handleSettingsChange({
        title: title,
        grade: level,
        subject: 'English',
        language: 'English',
        timestamp: timestamp,
        additionalInstructions: instructions
      });
      setLastTitleUsed(title);
    }
  }, [title, level, instructions, lastTitleUsed, handleSettingsChange]);

  // Ensure level and instructions are always passed to generation handler
  useEffect(() => {
    if (lastTitleUsed) { // Only update if title is already set
      console.log('Level or instructions changed, updating settings:', { level, instructions });
      handleSettingsChange({
        title: lastTitleUsed,
        grade: level,
        subject: 'English',
        language: 'English',
        timestamp: new Date().toISOString(),
        additionalInstructions: instructions
      });
    }
  }, [level, instructions, lastTitleUsed, handleSettingsChange]);
  
  return { lastTitleUsed };
};
