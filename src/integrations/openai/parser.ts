
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
    
    // Handle different response structures
    let lessonData = data;
    
    // Handle nested structures (lesson property)
    if (data && data.lesson) {
      lessonData = data.lesson;
      console.log('Using lesson property from response');
    }
    
    // Handle nested structures (data property)
    if (data && data.data) {
      lessonData = data.data;
      console.log('Using data property from response');
    }
    
    // Create a structured content with fallbacks
    const ensureArray = (field: any) => Array.isArray(field) ? field : (field ? [field] : []);
    
    const parsedContent: GeneratedLessonContent = {
      description: lessonData.description || defaultContent.description,
      objectives: ensureArray(lessonData.objectives || defaultContent.objectives),
      keyPhrases: ensureArray(lessonData.keyPhrases || defaultContent.keyPhrases),
      vocabulary: ensureArray(lessonData.vocabulary || defaultContent.vocabulary),
      practicalSituations: ensureArray(lessonData.practicalSituations || defaultContent.practicalSituations),
      explanations: ensureArray(lessonData.explanations || defaultContent.explanations),
      tips: ensureArray(lessonData.tips || defaultContent.tips)
    };
    
    // Add any metadata if it exists
    if (lessonData.metadata) {
      parsedContent.metadata = lessonData.metadata;
    }
    
    // Validate each required field has at least one item
    Object.entries(parsedContent).forEach(([key, value]) => {
      if (Array.isArray(value) && value.length === 0) {
        console.warn(`Empty array for ${key}, using default`);
        (parsedContent as any)[key] = (defaultContent as any)[key];
      }
    });
    
    console.log('Successfully parsed content:', parsedContent);
    return parsedContent;
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
