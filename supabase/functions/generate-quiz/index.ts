
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import Replicate from "https://esm.sh/replicate@0.25.2";

const MODEL_ID = "deepseek-ai/deepseek-r1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function buildPrompt(lessonContent: string, numQuestions: number = 5): string {
  return `Generate a multiple choice quiz based on this lesson content:

${lessonContent}

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
      throw new Error('REPLICATE_API_KEY is not set');
    }

    const replicate = new Replicate({
      auth: REPLICATE_API_KEY,
    });

    const { lessonContent, numQuestions = 5 } = await req.json();
    console.log("Generating quiz for content length:", lessonContent?.length);
    console.log("Number of questions requested:", numQuestions);

    if (!lessonContent) {
      throw new Error("Lesson content is required");
    }

    const prompt = buildPrompt(lessonContent, numQuestions);
    console.log("Generated prompt:", prompt);

    try {
      const output = await replicate.run(
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
        throw new Error(`Failed to parse quiz content: ${error.message}`);
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
