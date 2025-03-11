
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import Replicate from "https://esm.sh/replicate@0.25.2";

// Environment variables & constants
const REPLICATE_API_KEY = Deno.env.get("REPLICATE_API_KEY");
const MODEL_ID = "deepseek-ai/deepseek-r1"; 

// In-memory store for tracking ongoing predictions
// In a production app, you'd use a database for this
const predictionStore = new Map();

// CORS headers for cross-origin requests
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Parse and clean JSON output from Replicate
function parseOutput(output: any): any {
  try {
    // If it's already an array, join it into a string
    let outputText = Array.isArray(output) ? output.join("") : output;
    
    // If it's not a string (unlikely), convert it
    if (typeof outputText !== 'string') {
      outputText = JSON.stringify(output);
    }
    
    // Try to find JSON in the response (sometimes it's wrapped in markdown code blocks)
    const jsonMatch = outputText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonMatch && jsonMatch[1]) {
      try {
        return JSON.parse(jsonMatch[1]);
      } catch (e) {
        console.log("Failed to parse JSON from code block");
      }
    }
    
    // If the output is a JSON string, parse it
    try {
      return JSON.parse(outputText);
    } catch (e) {
      console.log("Failed to parse JSON from output text");
      
      // If it still fails, try to extract JSON by finding the outermost braces
      const startIdx = outputText.indexOf('{');
      const endIdx = outputText.lastIndexOf('}');
      
      if (startIdx >= 0 && endIdx > startIdx) {
        const jsonStr = outputText.substring(startIdx, endIdx + 1);
        try {
          return JSON.parse(jsonStr);
        } catch (e) {
          console.log("Failed to parse extracted JSON");
        }
      }
    }
    
    // Return the raw output if all parsing attempts fail
    return { rawOutput: outputText };
  } catch (error) {
    console.error("Error in parseOutput:", error);
    return { error: "Failed to parse output", rawOutput: output };
  }
}

// Build prompt for the AI model
function buildPrompt(requestData: any): string {
  const { 
    title, 
    level = "beginner", 
    language = "english", 
    sections = [],
    instructions = "" 
  } = requestData;

  // Base prompt with title and level
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

  return prompt;
}

// Main handler function
serve(async (req) => {
  console.log("Edge function invoked: generate-lesson-content");
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    console.log("Handling CORS preflight request");
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate API key
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

    // Initialize Replicate client
    const replicate = new Replicate({
      auth: REPLICATE_API_KEY,
    });

    // Parse request data
    const requestData = await req.json();
    
    // Check if this is a status check request
    if (requestData.predictionId) {
      const predictionId = requestData.predictionId;
      console.log("Status check request for prediction:", predictionId);
      
      try {
        // Check local store first
        if (predictionStore.has(predictionId)) {
          const storedPrediction = predictionStore.get(predictionId);
          console.log("Found prediction in local store:", storedPrediction);
          
          // If the prediction is complete, parse the output and return it
          if (storedPrediction.status === "succeeded") {
            const parsedOutput = parseOutput(storedPrediction.output);
            predictionStore.delete(predictionId); // Clean up
            
            return new Response(
              JSON.stringify({
                id: predictionId,
                status: "succeeded",
                lesson: parsedOutput
              }),
              {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
              }
            );
          }
          
          // If it failed, return the error
          if (storedPrediction.status === "failed") {
            predictionStore.delete(predictionId); // Clean up
            
            return new Response(
              JSON.stringify({
                id: predictionId,
                status: "failed",
                error: "Generation failed"
              }),
              {
                status: 500,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
              }
            );
          }
          
          // If it's still processing, check with Replicate for updates
          try {
            const prediction = await replicate.predictions.get(predictionId);
            console.log("Replicate status:", prediction.status);
            
            // Update local store
            predictionStore.set(predictionId, prediction);
            
            if (prediction.status === "succeeded") {
              const parsedOutput = parseOutput(prediction.output);
              
              return new Response(
                JSON.stringify({
                  id: predictionId,
                  status: "succeeded",
                  lesson: parsedOutput
                }),
                {
                  headers: { ...corsHeaders, "Content-Type": "application/json" },
                }
              );
            }
            
            // Return current status
            return new Response(
              JSON.stringify({
                id: predictionId,
                status: prediction.status
              }),
              {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
              }
            );
          } catch (error) {
            console.error("Error checking prediction status with Replicate:", error);
            
            // If we can't reach Replicate, return the last known status
            return new Response(
              JSON.stringify({
                id: predictionId,
                status: storedPrediction.status
              }),
              {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
              }
            );
          }
        } else {
          // If not in local store, check with Replicate directly
          try {
            const prediction = await replicate.predictions.get(predictionId);
            console.log("Replicate status (from direct check):", prediction.status);
            
            // Add to local store
            predictionStore.set(predictionId, prediction);
            
            if (prediction.status === "succeeded") {
              const parsedOutput = parseOutput(prediction.output);
              
              return new Response(
                JSON.stringify({
                  id: predictionId,
                  status: "succeeded",
                  lesson: parsedOutput
                }),
                {
                  headers: { ...corsHeaders, "Content-Type": "application/json" },
                }
              );
            }
            
            // Return current status
            return new Response(
              JSON.stringify({
                id: predictionId,
                status: prediction.status
              }),
              {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
              }
            );
          } catch (error) {
            console.error("Error checking prediction with Replicate:", error);
            
            return new Response(
              JSON.stringify({
                id: predictionId,
                status: "failed",
                error: "Prediction not found or inaccessible"
              }),
              {
                status: 404,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
              }
            );
          }
        }
      } catch (error) {
        console.error("Error in status check:", error);
        
        return new Response(
          JSON.stringify({
            id: predictionId,
            status: "failed",
            error: "Failed to check prediction status"
          }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
    }
    
    // If not a status check, this is a new generation request
    // Validate the title
    if (!requestData.title) {
      return new Response(
        JSON.stringify({ error: "Title is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log(`Generating lesson content for "${requestData.title}" at ${requestData.level || 'beginner'} level`);

    // Build the prompt
    const prompt = buildPrompt(requestData);
    console.log("Prompt:", prompt);
    
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
      
      // Start a new prediction
      const prediction = await replicate.predictions.create({
        version: MODEL_ID,
        input: modelInput
      });
      
      console.log("Prediction created:", prediction.id);
      
      // Store the prediction
      predictionStore.set(prediction.id, prediction);
      
      // Try to get a quick response (may still be processing)
      if (prediction.status === "succeeded") {
        // We got an immediate result (unlikely)
        const parsedOutput = parseOutput(prediction.output);
        
        return new Response(
          JSON.stringify({
            id: prediction.id,
            status: "succeeded",
            lesson: parsedOutput
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      
      // Return the prediction ID for status polling
      return new Response(
        JSON.stringify({
          id: prediction.id,
          status: prediction.status || "processing"
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    } catch (apiError) {
      console.error("Error calling Replicate API:", apiError);
      
      // Try direct generation as fallback
      try {
        // Create model input based on DeepSeek R1 requirements
        const modelInput = {
          prompt: prompt,
          max_new_tokens: 2048,
          temperature: 0.3,
          top_p: 0.9,
          top_k: 50
        };
        
        console.log("Trying direct generation with model:", MODEL_ID);
        
        // Use the run method to get direct output
        const output = await replicate.run(
          MODEL_ID,
          { input: modelInput }
        );
        
        console.log("Direct generation succeeded");
        
        // Process the output
        let processedOutput;
        if (Array.isArray(output)) {
          processedOutput = output.join("");
        } else {
          processedOutput = output;
        }
        
        const parsedOutput = parseOutput(processedOutput);
        
        return new Response(
          JSON.stringify({
            id: "direct",
            status: "succeeded",
            lesson: parsedOutput
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      } catch (fallbackError) {
        console.error("Fallback generation also failed:", fallbackError);
        
        return new Response(
          JSON.stringify({ 
            error: "Failed to generate content", 
            details: apiError.message || "Unknown API error"
          }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
    }
  } catch (error) {
    console.error("Error in generate-lesson-content function:", error);
    
    return new Response(
      JSON.stringify({ 
        error: "Internal server error", 
        details: error.message || "Unknown error"
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
