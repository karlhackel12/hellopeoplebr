
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import Replicate from "https://esm.sh/replicate@0.25.2";

const REPLICATE_API_KEY = Deno.env.get("REPLICATE_API_KEY");
const MODEL_ID = "deepseek-ai/deepseek-r1"; 

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  console.log("Edge function invoked: generate-lesson-content");
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    console.log("Handling CORS preflight request");
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Check if the Replicate API key is set
    if (!REPLICATE_API_KEY) {
      console.error("REPLICATE_API_KEY is not set in the environment");
      return new Response(
        JSON.stringify({ 
          error: "REPLICATE_API_KEY is not set", 
          details: "Please add the Replicate API key in the Supabase Edge Function secrets"
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const requestData = await req.json();
    const { 
      title, 
      level = "beginner", 
      language = "english", 
      sections = [],
      instructions = "" 
    } = requestData;

    console.log(`Generating lesson content for "${title}" at ${level} level`);
    console.log(`Input parameters:`, JSON.stringify(requestData, null, 2));

    if (!title) {
      return new Response(
        JSON.stringify({ error: "Title is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Initialize Replicate client
    const replicate = new Replicate({
      auth: REPLICATE_API_KEY,
    });

    // Build the prompt for the AI model
    let prompt = `Create an English language lesson with the title "${title}" for ${level} level students.`;
    
    // If specific sections are requested, only generate those
    if (sections.length > 0) {
      prompt += ` Only include these sections: ${sections.join(", ")}.`;
    }
    
    // Add any additional instructions from the user
    if (instructions) {
      prompt += `\n\nAdditional instructions: ${instructions}`;
    }
    
    // Add format instructions
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

    console.log("Prompt:", prompt);
    console.log("Calling Replicate API with model:", MODEL_ID);
    
    try {
      // Create proper model input based on DeepSeek R1 requirements
      const modelInput = {
        prompt: prompt,
        max_new_tokens: 2048,
        temperature: 0.3,
        top_p: 0.9,
        top_k: 50
      };
      
      console.log("Model input:", JSON.stringify(modelInput, null, 2));
      
      // Use the run method
      const output = await replicate.run(
        MODEL_ID,
        { input: modelInput }
      );

      console.log("Replicate API response type:", typeof output);
      console.log("Replicate API response sample:", Array.isArray(output) ? output.slice(0, 3) : output);
      
      let processedOutput;
      
      // Process the output based on its type
      if (Array.isArray(output)) {
        processedOutput = output.join("");
        console.log("Joined array output (first 100 chars):", processedOutput.substring(0, 100));
      } else if (typeof output === 'string') {
        processedOutput = output;
        console.log("String output (first 100 chars):", processedOutput.substring(0, 100));
      } else {
        console.log("Unexpected output format:", output);
        processedOutput = JSON.stringify(output);
      }
      
      return new Response(
        JSON.stringify({
          output: processedOutput,
          status: "succeeded"
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    } catch (apiError) {
      console.error("Error calling Replicate API:", apiError);
      console.error("Error details:", JSON.stringify(apiError, Object.getOwnPropertyNames(apiError)));
      
      return new Response(
        JSON.stringify({ 
          error: "Failed to generate content", 
          details: apiError.message || "Unknown API error",
          stack: apiError.stack
        }),
        {
          status: 502,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
  } catch (error) {
    console.error("Error in generate-lesson-content function:", error);
    console.error("Error details:", JSON.stringify(error, Object.getOwnPropertyNames(error)));
    
    return new Response(
      JSON.stringify({ 
        error: "Internal server error", 
        details: error.message || "Unknown error",
        stack: error.stack
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
