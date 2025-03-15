
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import Replicate from "https://esm.sh/replicate@0.25.2";

const REPLICATE_API_KEY = Deno.env.get("REPLICATE_API_KEY");
const MODEL_ID = "deepseek-ai/deepseek-r1";

// Updated CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  "Content-Type": "application/json"
};

// Timeout handler for model execution
const withTimeout = (promise, timeoutMs) => {
  let timeoutHandle;
  const timeoutPromise = new Promise((_, reject) => {
    timeoutHandle = setTimeout(() => {
      reject(new Error(`Operation timed out after ${timeoutMs}ms`));
    }, timeoutMs);
  });

  return Promise.race([
    promise,
    timeoutPromise
  ]).finally(() => {
    clearTimeout(timeoutHandle);
  });
};

function validateRequest(requestData: any): string | null {
  // Check if the request data is null or undefined
  if (!requestData) {
    return "Request data is missing";
  }

  // Check if the title is present
  if (!requestData.title) {
    return "Title is required";
  }

  // Check if level is valid
  if (requestData.level && !["beginner", "intermediate", "advanced"].includes(requestData.level)) {
    return "Invalid level: must be 'beginner', 'intermediate', or 'advanced'";
  }

  // Check if instructions is a string when provided
  if (requestData.instructions !== undefined && 
      requestData.instructions !== null && 
      typeof requestData.instructions !== 'string') {
    return "Instructions must be a string";
  }

  return null;
}

function buildPrompt(requestData: any): string {
  const { title, level = "beginner", instructions = "" } = requestData;
  
  // Modified prompt to generate fewer quiz questions (20 instead of 25)
  let prompt = `Create a comprehensive English lesson with 20 quiz questions about "${title}" for ${level} level students. All translations should be in Brazilian Portuguese.`;
  
  if (instructions) {
    prompt += `\n\nAdditional instructions: ${instructions}`;
  }
  
  prompt += `\n\nFormat the response as JSON with the following structure:
{
  "description": "A brief overview of the English lesson (2-3 sentences)",
  "keyPhrases": [
    {"phrase": "Key phrase 1", "translation": "Portuguese translation", "usage": "Example of how to use this phrase"},
    {"phrase": "Key phrase 2", "translation": "Portuguese translation", "usage": "Example of how to use this phrase"}
  ],
  "vocabulary": [
    {"word": "Word 1", "translation": "Portuguese translation", "partOfSpeech": "noun/verb/adj"},
    {"word": "Word 2", "translation": "Portuguese translation", "partOfSpeech": "noun/verb/adj"}
  ],
  "quiz": {
    "questions": [
      {
        "question": "Question text",
        "type": "multiple_choice",
        "options": ["option1", "option2", "option3", "option4"],
        "correct_answer": "correct option",
        "explanation": "Why this is correct"
      }
    ]
  }
}

Make sure the entire response is valid JSON. The content should be appropriate for ${level} level English students and focus specifically on the title topic. Include exactly 20 quiz questions. IMPORTANT: All translations must be in Brazilian Portuguese, not any other language.`;

  return prompt;
}

function parseOutput(output: any): any {
  try {
    // If it's already an array, join it
    let outputText = Array.isArray(output) ? output.join("") : output;
    
    // If it's not a string, convert it
    if (typeof outputText !== 'string') {
      outputText = JSON.stringify(output);
    }
    
    // Try to find JSON in markdown code blocks first
    const jsonMatch = outputText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonMatch && jsonMatch[1]) {
      return JSON.parse(jsonMatch[1]);
    }
    
    // Try to parse the entire output as JSON
    return JSON.parse(outputText);
  } catch (error) {
    console.error("Error parsing output:", error);
    throw new Error("Failed to parse model output as JSON");
  }
}

function validateOutput(parsedOutput: any): any {
  // Check for required fields
  const requiredFields = ["description", "keyPhrases", "vocabulary", "quiz"];
  const missingFields = requiredFields.filter(field => !parsedOutput[field]);
  
  if (missingFields.length > 0) {
    throw new Error(`Missing required fields: ${missingFields.join(", ")}`);
  }
  
  // Check quiz questions
  if (!parsedOutput.quiz.questions || !Array.isArray(parsedOutput.quiz.questions)) {
    throw new Error("Quiz questions missing or not an array");
  }
  
  // Verify quiz question count (should be 20)
  const questionCount = parsedOutput.quiz.questions.length;
  if (questionCount < 10) {
    console.warn(`Only ${questionCount} quiz questions generated, expected 20`);
  }
  
  // Default values if any key properties are missing
  const defaultContent = {
    description: "No description provided",
    keyPhrases: [{ phrase: "Example phrase", translation: "Translation", usage: "Basic usage" }],
    vocabulary: [{ word: "Example", translation: "Translation", partOfSpeech: "noun" }],
    quiz: {
      questions: []
    }
  };
  
  // Merge with defaults to ensure all required fields exist
  return {
    ...defaultContent,
    ...parsedOutput,
  };
}

function transformQuizQuestionsFormat(quizQuestions: any[]): any[] {
  // Transform the questions format to match what the database expects
  return quizQuestions.map((q, index) => {
    // Determine which option is correct
    const correctOptionIndex = q.options.findIndex(
      (opt: string) => opt === q.correct_answer
    );
    
    // Create options array with is_correct flag
    const formattedOptions = q.options.map((optionText: string, optIndex: number) => ({
      option_text: optionText,
      is_correct: optIndex === correctOptionIndex,
      order_index: optIndex
    }));
    
    return {
      question_text: q.question,
      question_type: "multiple_choice",
      points: 1,
      order_index: index,
      options: formattedOptions
    };
  });
}

serve(async (req) => {
  console.log("Edge function invoked: generate-lesson-content");
  console.log("Request URL:", req.url);
  console.log("Request method:", req.method);
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    console.log("Handling OPTIONS request with CORS headers");
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate API key
    if (!REPLICATE_API_KEY) {
      console.error("REPLICATE_API_KEY is not set");
      return new Response(
        JSON.stringify({ 
          error: "Server configuration error", 
          details: "API key is missing" 
        }),
        {
          status: 500,
          headers: corsHeaders
        }
      );
    }

    const replicate = new Replicate({
      auth: REPLICATE_API_KEY,
    });

    // Parse the request body
    let requestData;
    try {
      requestData = await req.json();
      console.log("Request data received:", requestData);
    } catch (parseError) {
      console.error("Error parsing request body:", parseError);
      return new Response(
        JSON.stringify({ error: "Invalid request body" }),
        {
          status: 400, 
          headers: corsHeaders
        }
      );
    }

    // Validate request data
    const validationError = validateRequest(requestData);
    if (validationError) {
      console.error("Validation error:", validationError);
      return new Response(
        JSON.stringify({ error: validationError }),
        {
          status: 400,
          headers: corsHeaders
        }
      );
    }

    // Build the prompt
    const prompt = buildPrompt(requestData);
    console.log("Generated prompt (truncated):", prompt.substring(0, 100) + "...");

    try {
      // Set up model parameters with REDUCED token limit for faster generation
      const modelInput = {
        prompt: prompt,
        max_new_tokens: 3072,  // Reduced from 4096 for faster generation
        temperature: 0.5,
        top_p: 0.9,
        top_k: 50
      };
      
      console.log("Calling Replicate with model:", MODEL_ID);
      console.log("Model input parameters:", JSON.stringify(modelInput, null, 2));
      
      // Run the model with a timeout of 40 seconds
      console.log("Starting Replicate API call with timeout...");
      
      const output = await withTimeout(
        replicate.run(MODEL_ID, { input: modelInput }),
        40000 // 40 second timeout
      );
      
      console.log("Model output received");
      console.log("Output type:", typeof output);
      console.log("Output sample:", Array.isArray(output) ? output.slice(0, 3) : output);
      
      // Parse and validate the output
      console.log("Parsing model output...");
      const parsedOutput = parseOutput(output);
      console.log("Output successfully parsed");
      
      const validatedOutput = validateOutput(parsedOutput);
      console.log("Output successfully validated");
      
      // Extract quiz questions and transform to the expected format
      console.log("Transforming quiz questions...");
      const quizQuestions = transformQuizQuestionsFormat(validatedOutput.quiz.questions || []);
      console.log(`Transformed ${quizQuestions.length} quiz questions`);
      
      // Create the lesson content structure (with only the required fields)
      const lessonContent = {
        description: validatedOutput.description,
        keyPhrases: validatedOutput.keyPhrases,
        vocabulary: validatedOutput.vocabulary,
      };
      
      console.log("Returning successful response");
      // Return successful response
      return new Response(
        JSON.stringify({
          status: "succeeded",
          lesson: lessonContent,
          quiz: {
            questions: quizQuestions
          }
        }),
        {
          headers: corsHeaders
        }
      );
    } catch (modelError) {
      console.error("Error running model:", modelError);
      
      // Check if this is a timeout error
      const isTimeout = modelError.message && modelError.message.includes("timed out");
      
      return new Response(
        JSON.stringify({
          error: isTimeout ? "Model execution timed out" : "Model execution failed", 
          details: modelError.message,
          status: "failed"
        }),
        {
          status: isTimeout ? 504 : 500,
          headers: corsHeaders
        }
      );
    }
  } catch (error) {
    console.error("Error in generate-lesson-content function:", error);
    
    return new Response(
      JSON.stringify({ 
        error: "Failed to generate content", 
        details: error.message,
        status: "failed"
      }),
      {
        status: 500,
        headers: corsHeaders
      }
    );
  }
});
