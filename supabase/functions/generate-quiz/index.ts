import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import Replicate from "https://esm.sh/replicate@0.25.2";

const MODEL_ID = "meta/llama-3-8b-instruct:2d19859030ff705a87c746f7e96eea03aefb71f166725aee39692f1476566d48"; // Using a more reliable model

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * Extracts key concepts and important sections from lesson content
 * to optimize the prompt for quiz generation
 */
function optimizeContent(lessonContent: string, maxLength: number = 12000): string {
  // If content is already within limits, return as is
  if (!lessonContent || lessonContent.length <= maxLength) {
    return lessonContent;
  }
  
  console.log("Content exceeds max length, optimizing:", lessonContent.length);
  
  // Look for headings to identify important sections
  const headingRegex = /#{1,3}\s+(.+)$/gm;
  const headings = [...lessonContent.matchAll(headingRegex)];
  
  // Extract content with key concepts (bolded text)
  const boldRegex = /\*\*(.+?)\*\*/g;
  const boldMatches = [...lessonContent.matchAll(boldRegex)];
  const boldedConcepts = boldMatches.map(match => match[1].trim());
  
  // If we found headings, use them to prioritize content
  if (headings.length > 0) {
    let result = "";
    const sections = [];
    
    // Split content by headings
    for (let i = 0; i < headings.length; i++) {
      const heading = headings[i];
      const nextHeading = headings[i + 1];
      const sectionStart = heading.index;
      const sectionEnd = nextHeading ? nextHeading.index : lessonContent.length;
      
      const section = lessonContent.substring(sectionStart, sectionEnd);
      sections.push(section);
    }
    
    // Sort sections by presence of key concepts and length
    const sortedSections = sections.sort((a, b) => {
      const aBolded = (a.match(boldRegex) || []).length;
      const bBolded = (b.match(boldRegex) || []).length;
      
      if (aBolded !== bBolded) return bBolded - aBolded;
      return b.length - a.length;
    });
    
    // Take sections until we reach max length
    for (const section of sortedSections) {
      if (result.length + section.length > maxLength) {
        break;
      }
      result += section + "\n\n";
    }
    
    // If we didn't get enough content, take the beginning of the original text
    if (result.length < maxLength * 0.5) {
      return lessonContent.substring(0, maxLength);
    }
    
    return result;
  }
  
  // If no headings found, extract key concepts and take beginning of content
  const keyConceptParts = [];
  
  // Include all bolded text as key concepts
  for (const match of boldMatches) {
    keyConceptParts.push(`**${match[1]}**`);
  }
  
  // Combine beginning of content + key concepts
  const beginningPortion = lessonContent.substring(0, maxLength * 0.8);
  const keyConcepts = keyConceptParts.join(", ");
  
  return beginningPortion + "\n\nKey concepts: " + keyConcepts;
}

/**
 * Builds an optimized prompt for quiz generation
 */
function buildPrompt(lessonContent: string, numQuestions: number = 5): string {
  // Optimize content first
  const trimmedContent = optimizeContent(lessonContent);
  
  return `Generate a comprehensive multiple choice quiz based on this lesson content:

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
7. Distribute questions across different sections of the content
8. Format your response as valid JSON
`;
}

/**
 * Validates and fixes quiz question data
 */
function validateAndFixQuestions(questions) {
  if (!Array.isArray(questions)) {
    console.error("Invalid questions format, not an array:", questions);
    return [];
  }
  
  const validatedQuestions = [];
  
  for (const question of questions) {
    if (!question.question_text || !question.options || !Array.isArray(question.options)) {
      console.log(`Skipping invalid question: ${JSON.stringify(question)}`);
      continue;
    }
    
    // Ensure points is valid
    if (!question.points || question.points < 1 || question.points > 5) {
      question.points = 1;
    }
    
    // Ensure question type is valid
    if (!question.question_type) {
      question.question_type = "multiple_choice";
    }
    
    // Ensure exactly one correct answer
    const correctOptions = question.options.filter((o) => o.is_correct);
    if (correctOptions.length !== 1) {
      // Fix the correct answers - make the first option correct if none are
      if (correctOptions.length === 0 && question.options.length > 0) {
        question.options[0].is_correct = true;
      } 
      // If multiple correct answers, keep only the first one correct
      else if (correctOptions.length > 1) {
        let foundCorrect = false;
        question.options = question.options.map((option) => {
          if (option.is_correct && !foundCorrect) {
            foundCorrect = true;
            return option;
          }
          return { ...option, is_correct: false };
        });
      }
    }
    
    // Ensure we have exactly 4 options
    if (question.options.length < 4) {
      // Add dummy options if needed
      while (question.options.length < 4) {
        question.options.push({
          option_text: `Additional option ${question.options.length + 1}`,
          is_correct: false
        });
      }
    } else if (question.options.length > 4) {
      // Trim to 4 options, but make sure we keep the correct one
      const correctOptionIndex = question.options.findIndex((o) => o.is_correct);
      if (correctOptionIndex >= 0) {
        const correctOption = question.options[correctOptionIndex];
        
        // Filter to keep the correct option and 3 others
        const incorrectOptions = question.options
          .filter((o) => !o.is_correct)
          .slice(0, 3);
          
        question.options = [correctOption, ...incorrectOptions];
      } else {
        question.options = question.options.slice(0, 4);
        question.options[0].is_correct = true;
      }
    }
    
    validatedQuestions.push(question);
  }
  
  return validatedQuestions;
}

/**
 * Extracts JSON from model output
 */
function parseModelOutput(output) {
  try {
    // If output is an array, join it
    const outputText = Array.isArray(output) ? output.join("") : output;
    
    // Try to find JSON in markdown code blocks first
    const jsonMatch = outputText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonMatch && jsonMatch[1]) {
      try {
        return JSON.parse(jsonMatch[1].trim());
      } catch (e) {
        console.error("Failed to parse JSON from code block", e);
      }
    }
    
    // Look for JSON object with curly braces
    const jsonObjectMatch = outputText.match(/\{[\s\S]*\}/);
    if (jsonObjectMatch) {
      try {
        return JSON.parse(jsonObjectMatch[0]);
      } catch (e) {
        console.error("Failed to parse JSON from object match", e);
      }
    }
    
    // Last resort: try to parse the entire output as JSON
    return JSON.parse(outputText);
  } catch (error) {
    console.error("Error parsing model output:", error);
    throw new Error("Failed to parse AI response as JSON");
  }
}

/**
 * Generates fallback questions if AI generation fails
 */
function generateFallbackQuestions(numQuestions = 5) {
  const questions = [];
  
  for (let i = 0; i < numQuestions; i++) {
    questions.push({
      question_text: `Question ${i + 1} (AI generation failed - please regenerate)`,
      points: 1,
      question_type: "multiple_choice",
      options: [
        { option_text: "Option A", is_correct: true },
        { option_text: "Option B", is_correct: false },
        { option_text: "Option C", is_correct: false },
        { option_text: "Option D", is_correct: false }
      ]
    });
  }
  
  return questions;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting quiz generation request");
    const startTime = Date.now();
    
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
    
    console.log("Request received for quiz generation");
    
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

    const prompt = buildPrompt(lessonContent, numQuestions);
    console.log("Generated prompt length:", prompt.length);

    // Create an AbortController for timeout management
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      console.log("Request timed out after 50 seconds");
      controller.abort();
    }, 50000); // 50-second timeout (lower than Deno's 60s limit)

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
      clearTimeout(timeoutId);
      
      console.log("Model response received, processing output");
      const processingStartTime = Date.now();
      
      let parsedOutput;
      try {
        parsedOutput = parseModelOutput(output);
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

      } catch (error) {
        console.error("Error processing AI response:", error);
        console.error("Raw output sample:", typeof output === 'string' 
          ? output.substring(0, 500) 
          : Array.isArray(output) 
            ? output.join("").substring(0, 500) 
            : JSON.stringify(output).substring(0, 500));
        
        // Generate fallback questions if we can't parse the response
        return new Response(
          JSON.stringify({ 
            status: "failed_with_fallback",
            questions: generateFallbackQuestions(numQuestions),
            error: error.message,
            raw_sample: typeof output === 'string' 
              ? output.substring(0, 200) 
              : Array.isArray(output) 
                ? output.join("").substring(0, 200) 
                : JSON.stringify(output).substring(0, 200)
          }),
          {
            status: 207, // Partial success
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

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

    } catch (modelError) {
      // Clear the timeout to prevent memory leaks
      clearTimeout(timeoutId);
      
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
  } catch (error) {
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
