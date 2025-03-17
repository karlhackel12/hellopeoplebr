
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { handleQuizGeneration, handleError } from "./handlers.ts";
import { corsHeaders } from "./utils.ts";

// Main handler for the edge function
serve(async (req) => {
  console.log("Quiz generation edge function invoked");
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  
  // Record start time for performance tracking
  const startTime = Date.now();
  
  try {
    // Parse request data
    const { lessonContent, numQuestions = 15 } = await req.json();
    
    if (!lessonContent) {
      return new Response(
        JSON.stringify({ error: "Lesson content is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
    
    console.log(`Generating ${numQuestions} quiz questions for content of length ${lessonContent.length}`);
    
    // Generate quiz questions
    return await handleQuizGeneration(lessonContent, numQuestions, startTime);
  } catch (error) {
    return handleError(error);
  }
});
