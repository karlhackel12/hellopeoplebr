
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

    const { transcript, lessonContent, difficulty, conversationHistory = [] } = await req.json();

    if (!transcript) {
      throw new Error('Missing required parameter: transcript');
    }

    // Define difficulty levels in the system prompt
    const difficultyDescription = {
      1: "Beginner level - Be very supportive and focus on basic pronunciation and simple grammar.",
      2: "Intermediate level - Provide constructive feedback on grammar, vocabulary, and pronunciation.",
      3: "Advanced level - Be more critical and focus on nuanced language use, advanced vocabulary, and natural fluency.",
    }[difficulty || 1];

    // Create a combined transcript if there's conversation history
    let fullTranscript = transcript;
    if (conversationHistory && conversationHistory.length > 0) {
      fullTranscript = conversationHistory.map(msg => `${msg.role === 'user' ? 'Student' : 'AI'}: ${msg.content}`).join('\n') + `\nStudent: ${transcript}`;
    }

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
              Analyze this conversation and provide detailed feedback and analytics in the following JSON format:
              {
                "feedback": "Detailed feedback on pronunciation, grammar, and fluency",
                "grammar": {
                  "score": 0-1 value (decimal between 0 and 1),
                  "issues": ["List of specific grammar issues"],
                  "strengths": ["List of grammar strengths"]
                },
                "fluency": {
                  "score": 0-1 value (decimal between 0 and 1),
                  "wordsPerMinute": estimated speaking rate,
                  "issues": ["List of fluency issues"],
                  "strengths": ["List of fluency strengths"]
                },
                "vocabulary": {
                  "score": 0-1 value (decimal between 0 and 1),
                  "used": ["List of notable vocabulary words used"],
                  "suggestions": ["Suggested words they could have used"],
                  "unique": number of unique words used,
                  "total": total word count
                },
                "suggestions": ["List of improvement suggestions"],
                "conversationTurns": number of student responses in the conversation,
                "speakingTime": estimated speaking time in seconds
              }
              
              The lesson content context is: "${lessonContent ? lessonContent.slice(0, 500) + '...' : 'General conversation practice'}"
              
              Only respond with the JSON. Do not include any other text in your response.`
          },
          {
            role: 'user',
            content: `Here is the conversation transcript:\n${fullTranscript}`
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
        grammar: {
          score: 0.7,
          issues: [],
          strengths: []
        },
        fluency: {
          score: 0.7,
          wordsPerMinute: 60,
          issues: [],
          strengths: []
        },
        vocabulary: {
          score: 0.7,
          used: [],
          suggestions: [],
          unique: 0,
          total: 0
        },
        suggestions: ["The system couldn't generate structured feedback. Please try again."],
        conversationTurns: conversationHistory ? conversationHistory.filter(msg => msg.role === 'user').length + 1 : 1,
        speakingTime: 30
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
