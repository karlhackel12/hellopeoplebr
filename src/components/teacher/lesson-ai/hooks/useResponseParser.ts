
import { GeneratedLessonContent } from '../types';

export const useResponseParser = () => {
  const parseAIResponse = (output: any): GeneratedLessonContent => {
    try {
      let parsedContent;
      
      // Handle different output formats
      if (typeof output === 'string') {
        // First, try to extract JSON from the string
        try {
          // Try to find JSON in markdown code blocks first
          const jsonMatch = output.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
          if (jsonMatch && jsonMatch[1]) {
            try {
              parsedContent = JSON.parse(jsonMatch[1]);
              console.log("Extracted JSON from code block");
            } catch (e) {
              console.log("Failed to parse JSON from code block");
            }
          }
          
          // If no code block match, try to extract using regex for JSON objects
          if (!parsedContent) {
            const jsonRegex = /{[\s\S]*}/;
            const match = output.match(jsonRegex);
            
            if (match) {
              const jsonString = match[0];
              console.log("Extracted JSON:", jsonString.substring(0, 100) + "...");
              parsedContent = JSON.parse(jsonString);
            } else {
              throw new Error("Could not extract valid JSON from string output");
            }
          }
        } catch (jsonError) {
          console.error("JSON extraction error:", jsonError);
          throw new Error(`Failed to extract JSON: ${jsonError.message}`);
        }
      } else if (typeof output === 'object' && output !== null) {
        // Check for lesson property in response structure
        if (output.lesson) {
          parsedContent = output.lesson;
          console.log("Using lesson property from response");
        } else {
          // Direct object output
          parsedContent = output;
        }
      } else {
        throw new Error(`Unsupported output format: ${typeof output}`);
      }
      
      // Default values if any key properties are missing
      const defaultContent: GeneratedLessonContent = {
        description: "No description provided",
        keyPhrases: [{ phrase: "Example phrase", translation: "Translation", usage: "Basic usage" }],
        vocabulary: [{ word: "Example", translation: "Translation", partOfSpeech: "noun" }]
      };
      
      // Merge with defaults to ensure all required fields exist
      parsedContent = {
        ...defaultContent,
        ...parsedContent,
      };
      
      return parsedContent as GeneratedLessonContent;
    } catch (error: any) {
      console.error("Error parsing AI response:", error);
      console.error("Raw output:", typeof output === 'string' 
        ? output.substring(0, 200) + "..." 
        : JSON.stringify(output).substring(0, 200) + "...");
      throw new Error(`Failed to process the generated content: ${error.message}`);
    }
  };

  return {
    parseAIResponse
  };
};
