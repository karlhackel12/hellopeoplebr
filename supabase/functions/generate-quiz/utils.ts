
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
4. Format your response as a JSON object with the following structure:

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
  if (content.length <= 4000) return content;
  
  // Simple content truncation approach to stay within limits
  return content.substring(0, 4000) + "\n\n[Content truncated due to length...]";
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
  
  // Set timeout to 45 seconds
  timeoutId = setTimeout(() => {
    controller.abort('Timeout: quiz generation is taking too long');
  }, 45000);
  
  return { controller, timeoutId, clearTimeout };
}
