
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { 
  handleQuizGeneration, 
  createFallbackResponse,
  handleError 
} from "./handlers.ts";
import { corsHeaders } from "./utils.ts";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting quiz generation request");
    const startTime = Date.now();
    
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
    
    console.log("Content length:", lessonContent?.length);
    console.log("Number of questions:", numQuestions);

    return await handleQuizGeneration(lessonContent, numQuestions, startTime);
  } catch (error) {
    return handleError(error);
  }
});
