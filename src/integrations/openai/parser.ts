
import { GeneratedLessonContent } from '@/components/teacher/lesson-ai/types';

export const parseLesson = (data: any): GeneratedLessonContent => {
  try {
    console.log('Parsing lesson data:', data);
    
    // Default structure with fallbacks for all required fields
    const defaultContent: GeneratedLessonContent = {
      description: "An English lesson to improve your language skills",
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
    
    // Check if data is already in the expected format
    if (data && typeof data === 'object') {
      // Direct format
      if (typeof data.description === 'string') {
        console.log('Data appears to be in GeneratedLessonContent format');
        
        // Ensure all required fields are arrays
        const ensureArray = (field: any) => Array.isArray(field) ? field : (field ? [field] : []);
        
        // Create a structured content with fallbacks
        const parsedContent: GeneratedLessonContent = {
          description: data.description || defaultContent.description,
          objectives: ensureArray(data.objectives || defaultContent.objectives),
          keyPhrases: ensureArray(data.keyPhrases || defaultContent.keyPhrases),
          vocabulary: ensureArray(data.vocabulary || defaultContent.vocabulary),
          practicalSituations: ensureArray(data.practicalSituations || defaultContent.practicalSituations),
          explanations: ensureArray(data.explanations || defaultContent.explanations),
          tips: ensureArray(data.tips || defaultContent.tips)
        };
        
        // Validate each required field has at least one item
        Object.entries(parsedContent).forEach(([key, value]) => {
          if (Array.isArray(value) && value.length === 0) {
            console.warn(`Empty array for ${key}, using default`);
            (parsedContent as any)[key] = (defaultContent as any)[key];
          }
        });
        
        console.log('Successfully parsed content:', parsedContent);
        return parsedContent;
      }
      
      // Nested in 'data' property (from our mock API)
      if (data.data && typeof data.data === 'object' && typeof data.data.description === 'string') {
        console.log('Data is nested in data property, extracting');
        return parseLesson(data.data);
      }
      
      // If we have sections format from old code, try to convert it
      if (data.sections && Array.isArray(data.sections)) {
        console.log('Converting from sections format to structured content');
        return defaultContent; // This is just a fallback, we should ideally convert it
      }
    }
    
    console.error('Invalid lesson data structure, using default:', data);
    return defaultContent;
  } catch (error) {
    console.error('Error parsing lesson data:', error);
    console.error('Using default content due to parsing error');
    return {
      description: "An English lesson to improve your language skills",
      objectives: ["Learn key vocabulary", "Practice useful phrases", "Apply grammar concepts"],
      keyPhrases: [{ phrase: "Example phrase", translation: "Example translation", usage: "Example usage context" }],
      vocabulary: [{ word: "Example", translation: "Translation", partOfSpeech: "noun", example: "This is an example." }],
      practicalSituations: [{ situation: "Example situation", example: "This is an example dialogue" }],
      explanations: [{ concept: "Grammar concept", explanation: "This is how the grammar works" }],
      tips: [{ tip: "Practice regularly", context: "Learning habit" }]
    };
  }
};
