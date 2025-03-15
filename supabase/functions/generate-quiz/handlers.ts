
import { corsHeaders, buildPrompt, optimizeContent, createTimeoutController } from "./utils.ts";
import { parseModelOutput, validateAndFixQuestions, generateFallbackQuestions } from "./parser.ts";
import Replicate from "https://esm.sh/replicate@0.25.2";

const REPLICATE_API_KEY = Deno.env.get("REPLICATE_API_KEY");
const MODEL_ID = "deepseek-ai/deepseek-r1";

export async function handleQuizGeneration(
  lessonContent: string, 
  numQuestions: number, 
  startTime: number
) {
  try {
    if (!REPLICATE_API_KEY) {
      throw new Error("REPLICATE_API_KEY is not set");
    }
    
    const replicate = new Replicate({
      auth: REPLICATE_API_KEY,
    });
    
    // Create timeout controller
    const { controller, timeoutId, clearTimeout } = createTimeoutController();
    
    try {
      // Optimize content to stay within token limits
      const optimizedContent = optimizeContent(lessonContent);
      
      // Build prompt for the model
      const prompt = buildPrompt(optimizedContent, numQuestions);
      
      console.log(`Calling model with prompt of length ${prompt.length}`);
      
      // Run the model with reduced token count
      const output = await replicate.run(MODEL_ID, {
        input: {
          prompt: prompt,
          max_new_tokens: 2048, // Reduced from 3072 for faster generation
          temperature: 0.6, // Slightly higher for more variety
          top_p: 0.9,
          top_k: 50,
        }
      }, { signal: controller.signal });
      
      // We got a successful response, clear the timeout
      clearTimeout();
      
      // Parse the model output into structured data
      const parsedOutput = parseModelOutput(output);
      
      // Ensure questions have proper structure and contain all required fields
      let validQuestions = [];
      
      if (parsedOutput && parsedOutput.questions && Array.isArray(parsedOutput.questions)) {
        validQuestions = validateAndFixQuestions(parsedOutput.questions);
      } else {
        console.warn("Invalid model output format, using fallback questions");
        validQuestions = generateFallbackQuestions(numQuestions);
      }
      
      // Calculate timing information for debugging
      const processingTime = Date.now() - startTime;
      
      console.log(`Generation completed in ${processingTime}ms`);
      
      // Return the processed questions
      return new Response(
        JSON.stringify({
          status: validQuestions.length === numQuestions ? "succeeded" : "failed_with_fallback",
          questions: validQuestions,
          processing_stats: {
            content_length: lessonContent.length,
            prompt_length: prompt.length,
            processing_time_ms: processingTime,
            total_time_ms: processingTime
          }
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    } catch (modelError) {
      clearTimeout();
      
      console.error("Model error:", modelError);
      
      // Generate fallback questions
      const fallbackQuestions = generateFallbackQuestions(numQuestions);
      
      // Calculate timing for error case
      const processingTime = Date.now() - startTime;
      
      // Special handling for timeout errors
      const isTimeout = modelError.name === "AbortError" || 
                        String(modelError).includes("aborted") ||
                        String(modelError).includes("timed out");
      
      // Return fallback questions with error info
      return new Response(
        JSON.stringify({
          status: "failed_with_fallback",
          error: isTimeout ? "Generation timed out" : "Model execution failed",
          questions: fallbackQuestions,
          processing_stats: {
            content_length: lessonContent.length,
            processing_time_ms: processingTime,
            error_details: modelError.message
          }
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }
  } catch (error) {
    console.error("Error in quiz generation:", error);
    
    // Return a generic error response
    return handleError(error);
  }
}

export function handleError(error: Error) {
  console.error(`Error in quiz generation: ${error.message}`);
  
  // Handle different types of errors
  const errorMessage = error.message || "Unknown error occurred";
  const isTimeout = errorMessage.includes("timed out") || errorMessage.includes("timeout");
  
  return new Response(
    JSON.stringify({
      error: isTimeout ? "Request timed out" : "Failed to generate quiz",
      details: errorMessage
    }),
    {
      status: isTimeout ? 504 : 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    }
  );
}
