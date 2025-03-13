import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import Replicate from "https://esm.sh/replicate@0.25.2";

const REPLICATE_API_KEY = Deno.env.get('REPLICATE_API_KEY');
const REPLICATE_MODEL = "meta/llama-3-70b-instruct:6ad3e3d2f5151fa45a1a14d0def0250cd223e6b6f531d42a53e9b98d91275d8c";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!REPLICATE_API_KEY) {
      throw new Error('REPLICATE_API_KEY is not set');
    }

    const requestData = await req.json();
    const { quizTitle, quizDescription, numQuestions = 5 } = requestData;

    if (!quizTitle) {
      return new Response(
        JSON.stringify({ error: 'Quiz title is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Generating quiz: "${quizTitle}" with ${numQuestions} questions`);

    const replicate = new Replicate({
      auth: REPLICATE_API_KEY,
    });

    const systemPrompt = `
    Act as a teacher creating a quiz. You will generate ${numQuestions} questions based on the title and description provided.
    The questions should be evenly distributed among these types:
    - multiple_choice: Questions with 4 options where only one is correct
    - true_false: True or False questions
    - fill_in_blank: Questions where users fill in a missing word or phrase
    
    Your response must be valid JSON that matches this exact structure:
    {
      "questions": [
        {
          "question_text": "string - the question text",
          "question_type": "one of: multiple_choice, true_false, fill_in_blank",
          "points": "number - difficulty level from 1-3",
          "options": [
            {
              "option_text": "string - text of the option",
              "is_correct": "boolean - whether this option is correct"
            }
          ]
        }
      ]
    }
    
    For true_false questions, include exactly two options: "True" and "False", with the correct one marked.
    For fill_in_blank questions, provide 4 options, with one being the correct answer.
    For multiple_choice questions, provide 4 options with only one marked as correct.
    
    All questions must have options, and each question must have exactly one correct answer.
    
    Ensure the response is valid JSON and contains the exact structure shown above. Do not include any text other than the JSON.
    `;

    const userPrompt = `
    Create a quiz titled "${quizTitle}".
    ${quizDescription ? `Description: ${quizDescription}` : ''}
    Generate exactly ${numQuestions} questions.
    `;

    console.log("Calling Replicate for quiz generation");
    const output = await replicate.run(REPLICATE_MODEL, {
      input: {
        prompt: userPrompt,
        system_prompt: systemPrompt,
        temperature: 0.7,
        max_tokens: 4000,
        top_p: 0.9,
      }
    });

    console.log("Received output from Replicate, parsing...");
    
    let quizData = null;
    try {
      // Extract the JSON part from the response if it's wrapped in backticks
      let jsonString = output.toString();
      const jsonMatch = jsonString.match(/```json\n([\s\S]*?)\n```/) || 
                       jsonString.match(/```\n([\s\S]*?)\n```/) ||
                       jsonString.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        jsonString = jsonMatch[0].replace(/```json\n|```\n|```/g, '');
      }
      
      quizData = JSON.parse(jsonString);
      
      // Validate structure
      if (!quizData.questions || !Array.isArray(quizData.questions)) {
        throw new Error('Response missing questions array');
      }

      // Validate and clean up each question
      quizData.questions = quizData.questions.map((q: any, index: number) => {
        if (!q.question_text) {
          throw new Error(`Question ${index} missing text`);
        }
        
        if (!q.question_type || !['multiple_choice', 'true_false', 'fill_in_blank'].includes(q.question_type)) {
          console.warn(`Question ${index} has invalid type, defaulting to multiple_choice`);
          q.question_type = 'multiple_choice';
        }
        
        if (!q.options || !Array.isArray(q.options) || q.options.length === 0) {
          throw new Error(`Question ${index} missing options`);
        }
        
        // Make sure true_false has exactly two options
        if (q.question_type === 'true_false' && q.options.length !== 2) {
          q.options = [
            { option_text: 'True', is_correct: q.options.some((o: any) => o.is_correct && o.option_text.toLowerCase().includes('true')) },
            { option_text: 'False', is_correct: q.options.some((o: any) => o.is_correct && o.option_text.toLowerCase().includes('false')) }
          ];
          
          // Ensure one is marked as correct
          if (!q.options.some((o: any) => o.is_correct)) {
            q.options[0].is_correct = true;
          }
        }
        
        // Make sure points are valid
        q.points = parseInt(q.points) || 1;
        if (q.points < 1 || q.points > 3) {
          q.points = 1;
        }
        
        // Ensure each question has exactly one correct answer
        const correctCount = q.options.filter((o: any) => o.is_correct).length;
        if (correctCount === 0) {
          q.options[0].is_correct = true;
        } else if (correctCount > 1 && q.question_type !== 'multiple_select') {
          // Keep only the first correct answer
          let foundCorrect = false;
          q.options = q.options.map((o: any) => {
            if (o.is_correct && !foundCorrect) {
              foundCorrect = true;
              return o;
            }
            return { ...o, is_correct: false };
          });
        }
        
        return q;
      });
      
    } catch (parseError) {
      console.error("Error parsing Replicate response:", parseError);
      console.log("Raw response:", output);
      
      return new Response(
        JSON.stringify({ 
          error: 'Failed to parse AI response', 
          details: parseError.message,
          rawOutput: output
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Successfully generated ${quizData.questions.length} questions`);
    
    return new Response(
      JSON.stringify({ 
        status: 'success',
        questions: quizData.questions,
        source: 'replicate'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error("Error generating quiz with Replicate:", error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Quiz generation failed', 
        details: error.message 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
