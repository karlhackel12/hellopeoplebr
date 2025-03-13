
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import Replicate from "https://esm.sh/replicate@0.25.2";

const REPLICATE_API_KEY = Deno.env.get("REPLICATE_API_KEY");
const MODEL_ID = "deepseek-ai/deepseek-r1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function buildPrompt(requestData: any): string {
  const { title, level = "beginner", instructions = "" } = requestData;
  
  let prompt = `Create a comprehensive English lesson with 25 quiz questions about "${title}" for ${level} level students. All translations should be in Brazilian Portuguese.`;
  
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

Make sure the entire response is valid JSON. The content should be appropriate for ${level} level English students and focus specifically on the title topic. Include exactly 25 quiz questions. IMPORTANT: All translations must be in Brazilian Portuguese, not any other language.`;

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
  
  // Verify quiz question count (should be 25)
  const questionCount = parsedOutput.quiz.questions.length;
  if (questionCount < 10) {
    console.warn(`Only ${questionCount} quiz questions generated, expected 25`);
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

serve(async (req) => {
  console.log("Edge function invoked: generate-lesson-content");
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate API key
    if (!REPLICATE_API_KEY) {
      throw new Error("REPLICATE_API_KEY is not set");
    }

    const replicate = new Replicate({
      auth: REPLICATE_API_KEY,
    });

    const requestData = await req.json();
    console.log("Request data:", requestData);

    // Validate title
    if (!requestData.title) {
      return new Response(
        JSON.stringify({ error: "Title is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Build the prompt
    const prompt = buildPrompt(requestData);
    console.log("Generated prompt:", prompt);

    try {
      // Set up model parameters with increased token limit for quiz generation
      const modelInput = {
        prompt: prompt,
        max_new_tokens: 4096,  // Increased for quiz content
        temperature: 0.5,
        top_p: 0.9,
        top_k: 50
      };
      
      console.log("Calling Replicate with model:", MODEL_ID);
      
      // Run the model directly
      const output = await replicate.run(MODEL_ID, {
        input: modelInput
      });
      
      console.log("Model output received");
      
      // Parse and validate the output
      const parsedOutput = parseOutput(output);
      const validatedOutput = validateOutput(parsedOutput);
      
      return new Response(
        JSON.stringify({
          status: "succeeded",
          lesson: validatedOutput
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    } catch (modelError) {
      console.error("Error running model:", modelError);
      throw new Error(`Model execution failed: ${modelError.message}`);
    }
  } catch (error) {
    console.error("Error in generate-lesson-content function:", error);
    
    return new Response(
      JSON.stringify({ 
        error: "Failed to generate content", 
        details: error.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
