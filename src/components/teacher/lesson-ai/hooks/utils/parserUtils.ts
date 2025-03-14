
import { parseLesson } from '@/integrations/openai/parser';
import { GeneratedLessonContent } from '../../types';

export const parseResponse = (responseData: any): GeneratedLessonContent | null => {
  try {
    const parsedContent = parseLesson(responseData);
    console.log('Parsed content:', parsedContent);
    return parsedContent;
  } catch (error) {
    console.error("Error parsing AI response:", error);
    return null;
  }
};
