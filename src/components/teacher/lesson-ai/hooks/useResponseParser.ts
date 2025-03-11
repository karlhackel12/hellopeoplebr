
import { GeneratedLessonContent } from '../types';

export const useResponseParser = () => {
  const parseAIResponse = (output: any): GeneratedLessonContent => {
    try {
      let parsedContent;
      
      if (typeof output === 'string') {
        const jsonStart = output.indexOf('{');
        const jsonEnd = output.lastIndexOf('}') + 1;
        
        if (jsonStart >= 0 && jsonEnd > jsonStart) {
          output = output.substring(jsonStart, jsonEnd);
        }
        
        console.log("Extracted JSON:", output);
        parsedContent = JSON.parse(output) as GeneratedLessonContent;
      } else if (Array.isArray(output) && output.length > 0) {
        // Some models return an array of strings
        const fullText = output.join('');
        const jsonStart = fullText.indexOf('{');
        const jsonEnd = fullText.lastIndexOf('}') + 1;
        
        if (jsonStart >= 0 && jsonEnd > jsonStart) {
          const jsonText = fullText.substring(jsonStart, jsonEnd);
          console.log("Extracted JSON from array:", jsonText);
          parsedContent = JSON.parse(jsonText) as GeneratedLessonContent;
        } else {
          throw new Error("Could not extract valid JSON from array output");
        }
      } else {
        // Direct object output
        parsedContent = output as GeneratedLessonContent;
      }
      
      return parsedContent;
    } catch (error: any) {
      console.error("Error parsing AI response:", error);
      throw new Error(`Failed to process the generated content: ${error.message}`);
    }
  };

  return {
    parseAIResponse
  };
};
