
import { toast } from 'sonner';

interface GenerationSettings {
  title: string;
  grade_level?: string;
  subject?: string;
  length?: string;
  tone?: string;
  focus_areas?: string;
  additional_instructions?: string;
}

// Function to generate lesson with proper logging
export const generateLesson = async (settings: GenerationSettings) => {
  try {
    console.log('Generating lesson with settings:', settings);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Create a more realistic lesson structure based on our GeneratedLessonContent type
    const mockResponse = {
      data: {
        description: `This is a comprehensive lesson about ${settings.title}. It is designed for ${settings.grade_level} level English learners.`,
        objectives: [
          "Learn key vocabulary related to the topic",
          "Practice essential phrases for real-world situations",
          "Understand grammatical concepts related to the lesson"
        ],
        keyPhrases: [
          {
            phrase: "Hello, how are you?",
            translation: "Olá, como você está?",
            usage: "Use this greeting when meeting someone"
          },
          {
            phrase: "I would like to learn more",
            translation: "Eu gostaria de aprender mais",
            usage: "Use this phrase to express interest in learning"
          }
        ],
        vocabulary: [
          {
            word: "Education",
            translation: "Educação",
            partOfSpeech: "noun",
            example: "Quality education is important."
          },
          {
            word: "Language",
            translation: "Idioma",
            partOfSpeech: "noun",
            example: "English is a global language."
          }
        ],
        practicalSituations: [
          {
            situation: "At a restaurant",
            example: "Waiter: What would you like to order?\nCustomer: I would like the chicken, please."
          },
          {
            situation: "Asking for directions",
            example: "Excuse me, could you tell me how to get to the museum?"
          }
        ],
        explanations: [
          {
            concept: "Present Simple",
            explanation: "We use the present simple to talk about regular actions and facts."
          },
          {
            concept: "Question Formation",
            explanation: "To form questions in English, we typically use an auxiliary verb before the subject."
          }
        ],
        tips: [
          {
            tip: "Practice speaking with native speakers when possible",
            context: "Conversation practice"
          },
          {
            tip: "Watch English movies with subtitles to improve comprehension",
            context: "Listening practice"
          }
        ]
      }
    };
    
    console.log('Generated mock lesson response:', mockResponse);
    return mockResponse;
  } catch (error) {
    console.error('Error generating lesson:', error);
    toast.error('Failed to generate lesson content');
    throw error;
  }
};
