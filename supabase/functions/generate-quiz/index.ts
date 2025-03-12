
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import Replicate from "https://esm.sh/replicate@0.25.2";

const MODEL_ID = "deepseek-ai/deepseek-r1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function buildPrompt(lessonContent: string, numQuestions: number = 5): string {
  // Limit content length to avoid token limits
  const maxContentLength = 12000;
  const trimmedContent = lessonContent.length > maxContentLength
    ? lessonContent.substring(0, maxContentLength) + "... (content truncated)"
    : lessonContent;
    
  return `Generate a multiple choice quiz based on this lesson content:

${trimmedContent}

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
`;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const REPLICATE_API_KEY = Deno.env.get('REPLICATE_API_KEY');
    if (!REPLICATE_API_KEY) {
      console.error('REPLICATE_API_KEY is not set');
      return new Response(
        JSON.stringify({ 
          error: "Configuration error",
          details: "Missing API key for AI service" 
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const replicate = new Replicate({
      auth: REPLICATE_API_KEY,
    });

    // Parse request body safely
    let requestBody;
    try {
      requestBody = await req.json();
    } catch (error) {
      console.error("Error parsing request body:", error);
      return new Response(
        JSON.stringify({ 
          error: "Invalid request",
          details: "Could not parse request body as JSON" 
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
    
    console.log("Request body:", JSON.stringify(requestBody));
    
    const { lessonContent, numQuestions = 5 } = requestBody;
    
    if (!lessonContent) {
      return new Response(
        JSON.stringify({ 
          error: "Missing content",
          details: "Lesson content is required" 
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
    
    console.log("Generating quiz for content length:", lessonContent?.length);
    console.log("Number of questions requested:", numQuestions);

    const prompt = buildPrompt(lessonContent, numQuestions);
    console.log("Generated prompt length:", prompt.length);

    try {
      // Set timeout for the Replicate API call
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Request timed out")), 60000);
      });

      const generatePromise = replicate.run(
        MODEL_ID,
        {
          input: {
            prompt: prompt,
            max_new_tokens: 2048,
            temperature: 0.3,
            top_p: 0.9,
            top_k: 50
          }
        }
      );

      // Race the generation against the timeout
      const output = await Promise.race([generatePromise, timeoutPromise]);

      console.log("Generation response type:", typeof output);
      console.log("Generation response:", output);

      let parsedOutput;
      try {
        // If output is an array, join it
        const outputText = Array.isArray(output) ? output.join("") : output;
        
        // Try to find JSON in markdown code blocks first
        const jsonMatch = outputText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
        if (jsonMatch && jsonMatch[1]) {
          parsedOutput = JSON.parse(jsonMatch[1]);
        } else {
          // Try to parse the entire output as JSON
          parsedOutput = JSON.parse(outputText);
        }
        
        // Validate the structure
        if (!parsedOutput.questions || !Array.isArray(parsedOutput.questions)) {
          throw new Error("Invalid response structure");
        }

        // Validate each question
        parsedOutput.questions.forEach((q: any, index: number) => {
          if (!q.question_text || !q.options || !Array.isArray(q.options)) {
            throw new Error(`Invalid question structure at index ${index}`);
          }
          
          // Ensure exactly one correct answer
          const correctAnswers = q.options.filter((o: any) => o.is_correct).length;
          if (correctAnswers !== 1) {
            throw new Error(`Question ${index + 1} must have exactly one correct answer`);
          }
        });

      } catch (error) {
        console.error("Error parsing AI response:", error);
        
        return new Response(
          JSON.stringify({ 
            error: "AI response parsing failed",
            details: error.message,
            raw_output: output
          }),
          {
            status: 422,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
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

    } catch (modelError: any) {
      console.error("Error running model:", modelError);
      
      let statusCode = 500;
      let errorMessage = "AI model execution failed";
      
      if (modelError.message?.includes("timed out")) {
        statusCode = 504;
        errorMessage = "AI model request timed out";
      } else if (modelError.status === 429) {
        statusCode = 429;
        errorMessage = "Too many requests to AI service";
      }
      
      return new Response(
        JSON.stringify({ 
          error: errorMessage,
          details: modelError.message || "Unknown error"
        }),
        {
          status: statusCode,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
  } catch (error: any) {
    console.error("Error in generate-quiz function:", error);
    
    return new Response(
      JSON.stringify({ 
        error: "Failed to generate quiz",
        details: error.message || "Unknown error" 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
