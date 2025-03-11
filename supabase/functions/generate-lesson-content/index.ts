
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
  
  let prompt = `Create an English language lesson with the title "${title}" for ${level} level students.`;
  
  if (instructions) {
    prompt += `\n\nAdditional instructions: ${instructions}`;
  }
  
  prompt += `\n\nFormat the response as JSON with the following structure:
{
  "description": "A brief overview of the English lesson (2-3 sentences)",
  "objectives": ["List of 3-5 learning objectives for English learners"],
  "practicalSituations": ["List of 2-3 real-world scenarios where this English would be used"],
  "keyPhrases": [{"phrase": "English phrase", "translation": "translation in student's language if needed", "usage": "brief context"}],
  "vocabulary": [{"word": "English word", "translation": "translation if needed", "partOfSpeech": "noun/verb/etc"}],
  "explanations": ["2-3 paragraphs explaining key English language concepts"],
  "tips": ["3-5 tips for practicing or remembering this English content"]
}

Make sure the entire response is valid JSON. The content should be appropriate for ${level} level English students and focus specifically on the title topic.`;

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
      // Set up model parameters
      const modelInput = {
        prompt: prompt,
        max_new_tokens: 2048,
        temperature: 0.3,
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
      
      return new Response(
        JSON.stringify({
          status: "succeeded",
          lesson: parsedOutput
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
