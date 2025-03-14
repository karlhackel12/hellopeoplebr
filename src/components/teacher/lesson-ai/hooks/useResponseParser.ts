
import { GeneratedLessonContent } from '../types';

/**
 * Hook for parsing AI generation responses into structured content
 */
export const useResponseParser = () => {
  /**
   * Extracts JSON content from string response
   */
  const extractJsonFromString = (output: string): any => {
    // Try to find JSON in markdown code blocks first
    const jsonMatch = output.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonMatch && jsonMatch[1]) {
      try {
        return JSON.parse(jsonMatch[1]);
      } catch (e) {
        console.log("Failed to parse JSON from code block");
      }
    }
    
    // Try to extract using regex for JSON objects
    const jsonRegex = /{[\s\S]*}/;
    const match = output.match(jsonRegex);
    
    if (match) {
      const jsonString = match[0];
      try {
        return JSON.parse(jsonString);
      } catch (parseError) {
        throw new Error(`Invalid JSON format in extracted string: ${parseError.message}`);
      }
    }
    
    throw new Error("Could not extract valid JSON from string output");
  };

  /**
   * Get default content structure with fallbacks
   */
  const getDefaultContent = (): GeneratedLessonContent => ({
    description: "No description provided",
    objectives: ["Learn key vocabulary", "Practice useful phrases", "Apply grammar concepts"],
    keyPhrases: [{ phrase: "Example phrase", translation: "Translation", usage: "Basic usage" }],
    vocabulary: [{ word: "Example", translation: "Translation", partOfSpeech: "noun", example: "Example sentence" }],
    practicalSituations: [{ situation: "Example situation", example: "Example dialogue" }],
    explanations: [{ concept: "Grammar concept", explanation: "Explanation of the concept" }],
    tips: [{ tip: "Practice regularly", context: "Learning strategy" }]
  });

  /**
   * Ensure arrays are properly formatted
   */
  const ensureArray = (field: any): any[] => 
    Array.isArray(field) ? field : (field ? [field] : []);

  /**
   * Handle different response structures and normalize
   */
  const normalizeResponseStructure = (output: any): any => {
    // Log the response type for debugging
    console.log("Parsing AI response:", typeof output, output ? 
      output.substring ? output.substring(0, 100) + "..." : 
      JSON.stringify(output).substring(0, 100) + "..." : "null");
    
    // Handle string output
    if (typeof output === 'string') {
      return extractJsonFromString(output);
    } 
    
    // Handle object output
    if (typeof output === 'object' && output !== null) {
      if (output.lesson) return output.lesson;
      if (output.data) return output.data;
      return output;
    }
    
    throw new Error(`Unsupported output format: ${typeof output}`);
  };

  /**
   * Validate and normalize the content structure
   */
  const validateContentStructure = (content: any, defaultContent: GeneratedLessonContent): GeneratedLessonContent => {
    const validated = { ...defaultContent, ...content };
    
    // Ensure all required arrays exist and are properly formatted
    validated.objectives = ensureArray(content.objectives || defaultContent.objectives);
    validated.keyPhrases = ensureArray(content.keyPhrases || defaultContent.keyPhrases);
    validated.vocabulary = ensureArray(content.vocabulary || defaultContent.vocabulary);
    validated.practicalSituations = ensureArray(content.practicalSituations || defaultContent.practicalSituations);
    validated.explanations = ensureArray(content.explanations || defaultContent.explanations);
    validated.tips = ensureArray(content.tips || defaultContent.tips);
    
    // Validate description
    if (!validated.description || typeof validated.description !== 'string') {
      validated.description = defaultContent.description;
    }
    
    // Ensure arrays have at least one item
    Object.entries(validated).forEach(([key, value]) => {
      if (Array.isArray(value) && value.length === 0) {
        (validated as any)[key] = (defaultContent as any)[key];
      }
    });
    
    return validated as GeneratedLessonContent;
  };

  /**
   * Parse AI response into structured lesson content
   */
  const parseAIResponse = (output: any): GeneratedLessonContent => {
    try {
      const defaultContent = getDefaultContent();
      const normalizedContent = normalizeResponseStructure(output);
      return validateContentStructure(normalizedContent, defaultContent);
    } catch (error: any) {
      console.error("Error parsing AI response:", error);
      console.error("Raw output preview:", typeof output === 'string' 
        ? output.substring(0, 200) + "..." 
        : JSON.stringify(output).substring(0, 200) + "...");
      throw new Error(`Failed to process the generated content: ${error.message}`);
    }
  };

  return {
    parseAIResponse
  };
};
