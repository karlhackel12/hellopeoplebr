
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Replicate from "https://esm.sh/replicate@0.25.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const REPLICATE_API_KEY = Deno.env.get("REPLICATE_API_KEY");
    if (!REPLICATE_API_KEY) {
      throw new Error("REPLICATE_API_KEY is not available");
    }

    const { quizTitle, quizDescription, numQuestions = 5 } = await req.json();

    if (!quizTitle) {
      return new Response(
        JSON.stringify({ error: "Quiz title is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log(`Generating quiz questions for: ${quizTitle}`);
    
    const replicate = new Replicate({
      auth: REPLICATE_API_KEY,
    });

    // Create a prompt for quiz generation
    const prompt = generatePrompt(quizTitle, quizDescription, numQuestions);
    
    // Call the Replicate API
    const output = await replicate.run(
      "meta/llama-3-8b-instruct:20440e4fdbb7e4a9e2d652737bb3fb87b08b9e759a37f97adcd2d5bd9b6c5ea1",
      {
        input: {
          prompt: prompt,
          system_prompt: "You are an expert educational quiz creator that creates high-quality quiz questions for students. Always respond with valid JSON.",
          max_tokens: 3000,
          temperature: 0.3,
          top_p: 0.9
        }
      }
    );

    // Parse and clean the output
    const parsedResponse = parseModelOutput(output);
    
    return new Response(
      JSON.stringify(parsedResponse),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error:", error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

// Helper function to generate the prompt
function generatePrompt(quizTitle: string, quizDescription: string, numQuestions: number): string {
  return `Create a quiz titled "${quizTitle}" ${quizDescription ? `about: ${quizDescription}` : ""}.
  
Generate ${numQuestions} multiple-choice questions with 4 options each, where only one option is correct.

The response should be a JSON object with this structure:
{
  "title": "${quizTitle}",
  "questions": [
    {
      "question_text": "Question text here?",
      "question_type": "multiple_choice",
      "points": 1,
      "options": [
        {"option_text": "First option", "is_correct": false},
        {"option_text": "Second option", "is_correct": true},
        {"option_text": "Third option", "is_correct": false},
        {"option_text": "Fourth option", "is_correct": false}
      ]
    }
  ]
}

Each question should:
1. Be clearly worded
2. Test understanding rather than just facts
3. Have four distinct answer options
4. Have exactly one correct answer 
5. Use the "multiple_choice" question type
6. Assign 1 point to each question

Make the questions challenging but appropriate for students. Ensure the JSON is properly formatted with no trailing commas.`;
}

// Helper function to parse and clean the model output
function parseModelOutput(output: any): any {
  let combinedOutput = "";
  
  if (Array.isArray(output)) {
    combinedOutput = output.join("");
  } else if (typeof output === "string") {
    combinedOutput = output;
  } else {
    throw new Error("Unexpected output format from Replicate");
  }
  
  // Find JSON in the response
  const jsonMatch = combinedOutput.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("No valid JSON found in the response");
  }
  
  let parsedJson;
  try {
    parsedJson = JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error("Error parsing JSON:", error);
    // Try to fix common JSON issues and parse again
    const fixedJson = fixJsonString(jsonMatch[0]);
    parsedJson = JSON.parse(fixedJson);
  }
  
  // Validate and fix the questions if needed
  if (!parsedJson.questions || !Array.isArray(parsedJson.questions)) {
    throw new Error("Invalid JSON structure: missing questions array");
  }
  
  // Ensure each question has the required fields
  parsedJson.questions = parsedJson.questions.map((q: any) => {
    return {
      question_text: q.question_text || "No question text provided",
      question_type: q.question_type || "multiple_choice",
      points: q.points || 1,
      options: (q.options || []).map((o: any) => ({
        option_text: o.option_text || "No option text provided",
        is_correct: !!o.is_correct
      }))
    };
  });
  
  return parsedJson;
}

// Helper function to fix common JSON issues
function fixJsonString(jsonString: string): string {
  // Replace single quotes with double quotes
  let fixed = jsonString.replace(/'/g, '"');
  
  // Fix trailing commas in arrays and objects
  fixed = fixed.replace(/,\s*}/g, '}').replace(/,\s*\]/g, ']');
  
  // Ensure property names are in double quotes
  fixed = fixed.replace(/(\w+):/g, '"$1":');
  
  return fixed;
}
