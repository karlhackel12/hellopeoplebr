
import { GeneratedLessonContent } from '../types';

export const useResponseParser = () => {
  const parseAIResponse = (output: any): GeneratedLessonContent => {
    try {
      let parsedContent;
      
      console.log("Parsing AI response:", typeof output, output ? output.substring ? output.substring(0, 100) + "..." : JSON.stringify(output).substring(0, 100) + "..." : "null");
      
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
              console.log("Failed to parse JSON from code block:", e);
            }
          }
          
          // If no code block match, try to extract using regex for JSON objects
          if (!parsedContent) {
            const jsonRegex = /{[\s\S]*}/;
            const match = output.match(jsonRegex);
            
            if (match) {
              const jsonString = match[0];
              console.log("Extracted JSON string (preview):", jsonString.substring(0, 100) + "...");
              try {
                parsedContent = JSON.parse(jsonString);
              } catch (parseError) {
                console.error("Failed to parse extracted JSON:", parseError);
                throw new Error(`Invalid JSON format: ${parseError.message}`);
              }
            } else {
              throw new Error("Could not extract valid JSON from string output");
            }
          }
        } catch (jsonError) {
          console.error("JSON extraction error:", jsonError);
          throw new Error(`Failed to extract JSON: ${jsonError.message}`);
        }
      } else if (typeof output === 'object' && output !== null) {
        // Check for different response structures
        if (output.lesson) {
          parsedContent = output.lesson;
          console.log("Using lesson property from response");
        } else if (output.data) {
          parsedContent = output.data;
          console.log("Using data property from response");
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
        objectives: ["Learn key vocabulary", "Practice useful phrases", "Apply grammar concepts"],
        keyPhrases: [{ phrase: "Example phrase", translation: "Translation", usage: "Basic usage" }],
        vocabulary: [{ word: "Example", translation: "Translation", partOfSpeech: "noun", example: "Example sentence" }],
        practicalSituations: [{ situation: "Example situation", example: "Example dialogue" }],
        explanations: [{ concept: "Grammar concept", explanation: "Explanation of the concept" }],
        tips: [{ tip: "Practice regularly", context: "Learning strategy" }]
      };
      
      // Ensure all required arrays exist
      const ensureArray = (field: any) => Array.isArray(field) ? field : (field ? [field] : []);
      
      // Merge with defaults to ensure all required fields exist
      parsedContent = {
        ...defaultContent,
        ...parsedContent,
        objectives: ensureArray(parsedContent.objectives || defaultContent.objectives),
        keyPhrases: ensureArray(parsedContent.keyPhrases || defaultContent.keyPhrases),
        vocabulary: ensureArray(parsedContent.vocabulary || defaultContent.vocabulary),
        practicalSituations: ensureArray(parsedContent.practicalSituations || defaultContent.practicalSituations),
        explanations: ensureArray(parsedContent.explanations || defaultContent.explanations),
        tips: ensureArray(parsedContent.tips || defaultContent.tips)
      };
      
      // Validate the structure before returning
      if (!parsedContent.description || typeof parsedContent.description !== 'string') {
        parsedContent.description = defaultContent.description;
      }
      
      // Ensure keyPhrases is a valid array
      if (!Array.isArray(parsedContent.keyPhrases) || parsedContent.keyPhrases.length === 0) {
        parsedContent.keyPhrases = defaultContent.keyPhrases;
      }
      
      // Ensure vocabulary is a valid array
      if (!Array.isArray(parsedContent.vocabulary) || parsedContent.vocabulary.length === 0) {
        parsedContent.vocabulary = defaultContent.vocabulary;
      }
      
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
