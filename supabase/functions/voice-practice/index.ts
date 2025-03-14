
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OPENAI_API_KEY is not set');
    }

    const { transcript, lessonContent, difficulty } = await req.json();

    if (!transcript || !lessonContent) {
      throw new Error('Missing required parameters: transcript and lessonContent');
    }

    // Define difficulty levels in the system prompt
    const difficultyDescription = {
      1: "Beginner level - Be very supportive and focus on basic pronunciation and simple grammar.",
      2: "Intermediate level - Provide constructive feedback on grammar, vocabulary, and pronunciation.",
      3: "Advanced level - Be more critical and focus on nuanced language use, advanced vocabulary, and natural fluency.",
    }[difficulty || 1];

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a supportive language tutor evaluating a student's speaking practice.
              ${difficultyDescription}
              Provide feedback in the following JSON format:
              {
                "feedback": "Detailed feedback on pronunciation, grammar, and fluency",
                "scores": {
                  "pronunciation": 0-10 value with one decimal place,
                  "grammar": 0-10 value with one decimal place,
                  "fluency": 0-10 value with one decimal place,
                  "overall": 0-10 value with one decimal place (average of the other three)
                },
                "corrections": ["List of specific corrections"],
                "suggestions": ["List of improvement suggestions"]
              }
              
              The lesson content context is: "${lessonContent.slice(0, 500)}..."`
          },
          {
            role: 'user',
            content: `Here is my spoken practice transcript: "${transcript}"`
          }
        ],
        temperature: 0.7
      }),
    });

    const result = await response.json();
    let feedbackText = result.choices[0].message.content;
    
    // Try to parse the JSON response
    try {
      const feedbackObject = JSON.parse(feedbackText);
      return new Response(JSON.stringify(feedbackObject), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (parseError) {
      // If parsing fails, return the text as is with a structured format
      console.error('Error parsing OpenAI response as JSON:', parseError);
      return new Response(JSON.stringify({
        feedback: feedbackText,
        scores: {
          pronunciation: 7.0,
          grammar: 7.0,
          fluency: 7.0,
          overall: 7.0
        },
        corrections: [],
        suggestions: ["The system couldn't generate structured feedback. Please try again."]
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  } catch (error) {
    console.error('Error in voice-practice function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
