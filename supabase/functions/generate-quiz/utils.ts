// CORS headers for edge function
export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS"
};

// Model ID for DeepSeek R1
export const MODEL_ID = "deepseek-ai/deepseek-r1";

// Build the prompt for quiz generation
export function buildPrompt(content: string, numQuestions: number): string {
  return `Create ${numQuestions} multiple-choice quiz questions based on the following English lesson content. 
All translations should be in Brazilian Portuguese where applicable.

LESSON CONTENT:
${content}

INSTRUCTIONS:
1. Create exactly ${numQuestions} multiple-choice questions based on the key concepts in the lesson.
2. Each question must have 4 options with only one correct answer.
3. The questions should test understanding of vocabulary, grammar, and concepts in the lesson.
4. Focus on the most important concepts from the lesson.
5. Format your response as a JSON object with the following structure:

{
  "questions": [
    {
      "question_text": "Question 1 text here",
      "options": [
        {"option_text": "Option 1", "is_correct": true},
        {"option_text": "Option 2", "is_correct": false},
        {"option_text": "Option 3", "is_correct": false},
        {"option_text": "Option 4", "is_correct": false}
      ]
    }
  ]
}

IMPORTANT: The entire response must be valid JSON. DO NOT include any explanatory text before or after the JSON.`;
}

// Optimize content to stay within token limits
export function optimizeContent(content: string): string {
  // If content is already small enough, return as is
  if (content.length <= 3000) return content;
  
  // For longer content, use a smarter approach to preserve structure
  // First, try to identify if this is markdown with sections
  const sections = content.split(/#{2,3}\s+/g);
  
  if (sections.length > 1) {
    // If we have sections, keep the first section (intro) and key sections
    // but truncate each to maintain structure
    const maxSectionLength = Math.floor(3000 / sections.length);
    
    return sections
      .map((section, index) => {
        // Keep section headers except for the first one (which doesn't have one)
        const prefix = index === 0 ? '' : '## ';
        // Truncate each section to maintain overall structure
        const truncatedSection = section.length > maxSectionLength 
          ? section.substring(0, maxSectionLength) + '...'
          : section;
        return prefix + truncatedSection;
      })
      .join('\n\n');
  }
  
  // Simple fallback: keep beginning and end of content
  return content.substring(0, 1500) + 
    "\n\n[Content truncated due to length...]\n\n" + 
    content.substring(content.length - 1500);
}

// Create a timeout controller for managing API calls
export function createTimeoutController() {
  const controller = new AbortController();
  let timeoutId: number;
  
  const clearTimeout = () => {
    if (timeoutId) {
      window.clearTimeout(timeoutId);
    }
  };
  
  // Set timeout to 35 seconds (reduced from 45s)
  timeoutId = setTimeout(() => {
    controller.abort('Timeout: quiz generation is taking too long');
  }, 35000);
  
  return { controller, timeoutId, clearTimeout };
}
