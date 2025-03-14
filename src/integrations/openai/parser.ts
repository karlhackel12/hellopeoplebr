
import { GeneratedLessonContent } from '@/components/teacher/lesson-ai/types';

export const parseLesson = (data: any): any => {
  try {
    console.log('Parsing lesson data:', data);
    
    // Check if data is already in the expected format
    if (data && 
        typeof data.description === 'string' && 
        Array.isArray(data.objectives) &&
        Array.isArray(data.keyPhrases) &&
        Array.isArray(data.vocabulary)) {
      
      console.log('Data is already in GeneratedLessonContent format');
      return data as GeneratedLessonContent;
    }
    
    // If we have the sections format from old code, try to convert it
    if (data.sections && Array.isArray(data.sections)) {
      console.log('Converting from sections format to structured content');
      
      // Create a structured content object from sections
      const structuredContent: GeneratedLessonContent = {
        description: data.sections.find(s => s.type === 'introduction')?.content || 
                     "An English lesson to improve your language skills",
        objectives: ["Learn key vocabulary", "Practice useful phrases", "Apply grammar concepts"],
        keyPhrases: [
          {
            phrase: "Example phrase",
            translation: "Example translation",
            usage: "Example usage context"
          }
        ],
        vocabulary: [
          {
            word: "Example",
            translation: "Translation",
            partOfSpeech: "noun",
            example: "This is an example sentence."
          }
        ],
        practicalSituations: [
          {
            situation: "Example situation",
            example: "This is an example dialogue"
          }
        ],
        explanations: [
          {
            concept: "Grammar concept",
            explanation: "This is how the grammar works"
          }
        ],
        tips: [
          {
            tip: "Practice regularly",
            context: "Learning habit"
          }
        ]
      };
      
      console.log('Converted to structured content:', structuredContent);
      return structuredContent;
    }
    
    throw new Error('Invalid lesson data structure');
  } catch (error) {
    console.error('Error parsing lesson data:', error);
    throw error;
  }
};
