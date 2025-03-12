
import Replicate from "https://esm.sh/replicate@0.25.2";
import { 
  corsHeaders, 
  MODEL_ID, 
  buildPrompt,
  createTimeoutController,
  optimizeContent
} from "./utils.ts";
import { 
  parseModelOutput, 
  validateAndFixQuestions, 
  generateFallbackQuestions 
} from "./parser.ts";

/**
 * Creates a response with fallback questions when generation fails
 */
export function createFallbackResponse(numQuestions: number, error: any, rawSample?: string) {
  console.error("Using fallback response due to error:", error);
  
  return new Response(
    JSON.stringify({ 
      status: "failed_with_fallback",
      questions: generateFallbackQuestions(numQuestions),
      error: error.message || "Unknown error",
      raw_sample: rawSample
    }),
    {
      status: 207, // Partial success
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    }
  );
}

/**
 * Handles errors in the request flow
 */
export function handleError(error: any) {
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

/**
 * Core function that handles the quiz generation process
 */
export async function handleQuizGeneration(lessonContent: string, numQuestions: number, startTime: number) {
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

  // Optimize content before generating the prompt
  const optimizedContent = optimizeContent(lessonContent);
  const prompt = buildPrompt(optimizedContent, numQuestions);
  console.log("Generated prompt length:", prompt.length);

  // Create an AbortController for timeout management
  const { controller, timeoutId, clearTimeout } = createTimeoutController();

  try {
    console.log("Calling model API for quiz generation");
    
    const output = await replicate.run(
      MODEL_ID,
      {
        input: {
          prompt: prompt,
          max_tokens: 4000,
          temperature: 0.2,
          top_p: 0.9,
          system_prompt: "You are an expert education quiz creator. Create well-structured quiz questions that test understanding of educational content. Always return valid JSON."
        }
      },
      { signal: controller.signal }
    );
    
    // Clear the timeout since we got a response
    clearTimeout();
    
    console.log("Model response received, processing output");
    const processingStartTime = Date.now();
    
    try {
      const parsedOutput = parseModelOutput(output);
      console.log("Successfully parsed JSON response");
      
      // Validate the structure
      if (!parsedOutput.questions || !Array.isArray(parsedOutput.questions)) {
        console.error("Invalid response structure", JSON.stringify(parsedOutput).substring(0, 200));
        throw new Error("Invalid response structure - missing questions array");
      }

      // Validate and fix each question
      const validatedQuestions = validateAndFixQuestions(parsedOutput.questions);
      
      // Make sure we have at least one question
      if (validatedQuestions.length === 0) {
        console.error("No valid questions were generated");
        throw new Error("No valid questions were generated");
      }
      
      parsedOutput.questions = validatedQuestions;

      const processingTime = Date.now() - processingStartTime;
      const totalTime = Date.now() - startTime;
      console.log(`Successfully generated ${parsedOutput.questions.length} quiz questions`);
      console.log(`Processing time: ${processingTime}ms, Total time: ${totalTime}ms`);
      
      return new Response(
        JSON.stringify({
          status: "succeeded",
          questions: parsedOutput.questions,
          processing_stats: {
            content_length: lessonContent.length,
            prompt_length: prompt.length,
            processing_time_ms: processingTime,
            total_time_ms: totalTime
          }
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );

    } catch (parseError) {
      console.error("Error processing AI response:", parseError);
      const rawSample = typeof output === 'string' 
        ? output.substring(0, 200) 
        : Array.isArray(output) 
          ? output.join("").substring(0, 200) 
          : JSON.stringify(output).substring(0, 200);
          
      console.error("Raw output sample:", rawSample);
      
      // Generate fallback questions if we can't parse the response
      return createFallbackResponse(numQuestions, parseError, rawSample);
    }

  } catch (modelError) {
    // Clear the timeout to prevent memory leaks
    clearTimeout();
    
    console.error("Error running model:", modelError);
    
    let statusCode = 500;
    let errorMessage = "AI model execution failed";
    
    if (modelError.name === "AbortError" || modelError.message?.includes("timed out")) {
      statusCode = 504;
      errorMessage = "AI model request timed out";
    } else if (modelError.status === 429) {
      statusCode = 429;
      errorMessage = "Too many requests to AI service";
    }
    
    // Generate fallback questions with error message
    return new Response(
      JSON.stringify({ 
        status: "failed_with_fallback",
        questions: generateFallbackQuestions(numQuestions),
        error: errorMessage,
        details: modelError.message || "Unknown error"
      }),
      {
        status: 207, // Partial success with fallback
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
}
