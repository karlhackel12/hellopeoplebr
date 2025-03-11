
import { GeneratedLessonContent } from '../types';

export const useResponseParser = () => {
  const parseAIResponse = (output: any): GeneratedLessonContent => {
    try {
      let parsedContent;
      
      // Handle different output formats
      if (typeof output === 'string') {
        // Try to find JSON in the string response
        const jsonRegex = /{[\s\S]*}/;
        const match = output.match(jsonRegex);
        
        if (match) {
          const jsonString = match[0];
          console.log("Extracted JSON:", jsonString);
          parsedContent = JSON.parse(jsonString) as GeneratedLessonContent;
        } else {
          throw new Error("Could not extract valid JSON from string output");
        }
      } else if (Array.isArray(output) && output.length > 0) {
        // Join array elements (common format for Deepseek R1) and extract JSON
        const fullText = output.join('');
        console.log("Processing array output as joined text:", fullText.substring(0, 100) + "...");
        
        const jsonRegex = /{[\s\S]*?}(?=\s*$)/;
        const match = fullText.match(jsonRegex);
        
        if (match) {
          const jsonString = match[0];
          console.log("Extracted JSON from array:", jsonString.substring(0, 100) + "...");
          try {
            parsedContent = JSON.parse(jsonString) as GeneratedLessonContent;
          } catch (parseError) {
            console.error("Error parsing extracted JSON:", parseError);
            
            // More aggressive JSON extraction as fallback
            const startIndex = fullText.indexOf('{');
            const endIndex = fullText.lastIndexOf('}');
            
            if (startIndex >= 0 && endIndex > startIndex) {
              const jsonCandidate = fullText.substring(startIndex, endIndex + 1);
              console.log("Fallback JSON extraction attempt:", jsonCandidate.substring(0, 100) + "...");
              parsedContent = JSON.parse(jsonCandidate) as GeneratedLessonContent;
            } else {
              throw new Error("Could not extract valid JSON from output");
            }
          }
        } else {
          throw new Error("Could not extract valid JSON from array output");
        }
      } else if (typeof output === 'object' && output !== null) {
        // Direct object output
        parsedContent = output as GeneratedLessonContent;
      } else {
        throw new Error(`Unsupported output format: ${typeof output}`);
      }
      
      // Validate that we have the required fields
      if (!parsedContent.description || !Array.isArray(parsedContent.objectives)) {
        throw new Error("Generated content is missing required fields");
      }
      
      return parsedContent;
    } catch (error: any) {
      console.error("Error parsing AI response:", error);
      console.error("Raw output:", output);
      throw new Error(`Failed to process the generated content: ${error.message}`);
    }
  };

  return {
    parseAIResponse
  };
};
