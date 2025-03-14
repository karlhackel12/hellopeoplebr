
import { toast } from 'sonner';
import { GeneratedLessonContent } from '@/components/teacher/lesson-ai/types';

interface GenerationSettings {
  title: string;
  grade_level: string;
  subject: string;
  language: string;
  timestamp: string;
  additional_instructions?: string;
}

// Function to generate lesson with proper logging
export const generateLesson = async (settings: GenerationSettings) => {
  try {
    console.log('Generating lesson with settings:', settings);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Create a standardized lesson structure based on GeneratedLessonContent type
    const response = {
      status: 'succeeded',
      lesson: {
        description: `This is a comprehensive lesson about ${settings.title}. It is designed for ${settings.grade_level || 'beginner'} level English learners.`,
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
        ],
        metadata: {
          title: settings.title,
          level: settings.grade_level || 'beginner',
          language: settings.language || 'English',
          model: 'deepseek-r1',
          status: 'succeeded',
          timestamp: settings.timestamp,
          completed: new Date().toISOString()
        }
      },
      // Include optional quiz data
      quiz: {
        questions: [
          {
            question: "What is the correct greeting?",
            options: ["Hello, how are you?", "What is your name?", "Where are you from?", "What time is it?"],
            correctAnswer: 0
          },
          {
            question: "Which tense do we use for regular actions?",
            options: ["Present Simple", "Present Continuous", "Past Simple", "Future"],
            correctAnswer: 0
          }
        ]
      }
    };
    
    console.log('Generated lesson response:', response);
    return response;
  } catch (error) {
    console.error('Error generating lesson:', error);
    toast.error('Failed to generate lesson content');
    throw error;
  }
};
