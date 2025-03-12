
// Constants and utility functions
export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

export const MODEL_ID = "meta/llama-3-8b-instruct:2d19859030ff705a87c746f7e96eea03aefb71f166725aee39692f1476566d48";

/**
 * Optimizes content length by prioritizing important sections
 */
export function optimizeContent(lessonContent: string, maxLength: number = 12000): string {
  // If content is already within limits, return as is
  if (!lessonContent || lessonContent.length <= maxLength) {
    return lessonContent;
  }
  
  console.log("Content exceeds max length, optimizing:", lessonContent.length);
  
  // Look for headings to identify important sections
  const headingRegex = /#{1,3}\s+(.+)$/gm;
  const headings = [...lessonContent.matchAll(headingRegex)];
  
  // Extract content with key concepts (bolded text)
  const boldRegex = /\*\*(.+?)\*\*/g;
  const boldMatches = [...lessonContent.matchAll(boldRegex)];
  const boldedConcepts = boldMatches.map(match => match[1].trim());
  
  // If we found headings, use them to prioritize content
  if (headings.length > 0) {
    let result = "";
    const sections = [];
    
    // Split content by headings
    for (let i = 0; i < headings.length; i++) {
      const heading = headings[i];
      const nextHeading = headings[i + 1];
      const sectionStart = heading.index!; // Non-null assertion since we know index exists from matchAll
      const sectionEnd = nextHeading ? nextHeading.index! : lessonContent.length;
      
      const section = lessonContent.substring(sectionStart, sectionEnd);
      sections.push(section);
    }
    
    // Sort sections by presence of key concepts and length
    const sortedSections = sections.sort((a, b) => {
      const aBolded = (a.match(boldRegex) || []).length;
      const bBolded = (b.match(boldRegex) || []).length;
      
      if (aBolded !== bBolded) return bBolded - aBolded;
      return b.length - a.length;
    });
    
    // Take sections until we reach max length
    for (const section of sortedSections) {
      if (result.length + section.length > maxLength) {
        break;
      }
      result += section + "\n\n";
    }
    
    // If we didn't get enough content, take the beginning of the original text
    if (result.length < maxLength * 0.5) {
      return lessonContent.substring(0, maxLength);
    }
    
    return result;
  }
  
  // If no headings found, extract key concepts and take beginning of content
  const keyConceptParts = [];
  
  // Include all bolded text as key concepts
  for (const match of boldMatches) {
    keyConceptParts.push(`**${match[1]}**`);
  }
  
  // Combine beginning of content + key concepts
  const beginningPortion = lessonContent.substring(0, maxLength * 0.8);
  const keyConcepts = keyConceptParts.join(", ");
  
  return beginningPortion + "\n\nKey concepts: " + keyConcepts;
}

/**
 * Builds an optimized prompt for quiz generation
 */
export function buildPrompt(lessonContent: string, numQuestions: number = 5): string {
  return `Generate a comprehensive multiple choice quiz based on this lesson content:

${lessonContent}

Create exactly ${numQuestions} multiple choice questions. Format the response as JSON with this structure:
{
  "questions": [
    {
      "question_text": "Question text here",
      "points": number between 1-5,
      "question_type": "multiple_choice",
      "options": [
        {
          "option_text": "option text",
          "is_correct": boolean
        }
      ]
    }
  ]
}

Rules:
1. Each question must have 4 options with exactly one correct answer
2. Questions should test understanding, not just memorization
3. All content must be relevant to the lesson
4. Make the options sound plausible but clearly distinguish correct from incorrect
5. Ensure questions are diverse and cover different aspects of the content
6. Points should be assigned based on question complexity (1-5)
7. Distribute questions across different sections of the content
8. Format your response as valid JSON
`;
}

/**
 * Creates a timeout controller for request handling
 */
export function createTimeoutController(timeoutMs: number = 50000): { 
  controller: AbortController;
  timeoutId: number;
  clearTimeout: () => void;
} {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    console.log(`Request timed out after ${timeoutMs/1000} seconds`);
    controller.abort();
  }, timeoutMs);
  
  return {
    controller,
    timeoutId,
    clearTimeout: () => clearTimeout(timeoutId)
  };
}
