
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import Replicate from "https://esm.sh/replicate@0.25.2";

const REPLICATE_API_KEY = Deno.env.get("REPLICATE_API_KEY");
const MODEL_ID = "deepseek-ai/deepseek-r1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function buildPrompt(lessonContent: string): string {
  return `Generate a multiple choice quiz based on this lesson content:

${lessonContent}

Format the response as JSON with the following structure:
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
1. Generate 3-5 questions
2. Each question must have 4 options with exactly one correct answer
3. Questions should test understanding, not just memorization
4. All content must be relevant to the lesson
5. Make sure the entire response is valid JSON
`;
}

serve(async (req) => {
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

    // Validate lesson content
    if (!requestData.lessonContent) {
      return new Response(
        JSON.stringify({ error: "Lesson content is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Build the prompt
    const prompt = buildPrompt(requestData.lessonContent);
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
      
      // Run the model
      const output = await replicate.run(MODEL_ID, {
        input: modelInput
      });
      
      console.log("Model output received:", output);
      
      // Parse the output
      let parsedOutput;
      if (typeof output === 'string') {
        // Try to find JSON in markdown code blocks first
        const jsonMatch = output.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
        if (jsonMatch && jsonMatch[1]) {
          parsedOutput = JSON.parse(jsonMatch[1]);
        } else {
          // Try to parse the entire output as JSON
          parsedOutput = JSON.parse(output);
        }
      } else if (Array.isArray(output)) {
        parsedOutput = JSON.parse(output.join(''));
      } else {
        parsedOutput = output;
      }
      
      return new Response(
        JSON.stringify({
          status: "succeeded",
          questions: parsedOutput.questions
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
    console.error("Error in generate-quiz function:", error);
    
    return new Response(
      JSON.stringify({ 
        error: "Failed to generate quiz", 
        details: error.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
