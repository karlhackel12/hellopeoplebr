
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const REPLICATE_API_KEY = Deno.env.get("REPLICATE_API_KEY");
const MODEL_ID = "deepseek-ai/deepseek-r1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!REPLICATE_API_KEY) {
      throw new Error("REPLICATE_API_KEY is not set");
    }

    const requestData = await req.json();
    const { 
      title, 
      level = "beginner", 
      language = "english", 
      sections = [],
      instructions = "" 
    } = requestData;

    console.log(`Generating English lesson content for "${title}" at ${level} level`);
    if (instructions) {
      console.log(`With instructions: ${instructions}`);
    }

    if (!title) {
      return new Response(
        JSON.stringify({ error: "Title is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const systemPrompt = `You are an experienced English language teacher with expertise in creating EFL (English as a Foreign Language) content. 
Create educational content for an English lesson with the title "${title}" for ${level} level students.`;

    let userPrompt = `Generate a well-structured English language lesson with the following components:`;
    
    // If specific sections are requested, only generate those
    if (sections.length > 0) {
      userPrompt += ` Only generate the following sections: ${sections.join(", ")}.`;
    } else {
      userPrompt += ` Generate all sections.`;
    }
    
    // Add any additional instructions from the user
    if (instructions) {
      userPrompt += `\n\nAdditional instructions to follow: ${instructions}`;
    }
    
    userPrompt += `

Format the response as JSON with the following structure:
{
  "description": "A brief overview of the English lesson (2-3 sentences)",
  "objectives": ["List of 3-5 learning objectives for English learners"],
  "practicalSituations": ["List of 2-3 real-world scenarios where this English would be used"],
  "keyPhrases": [{"phrase": "English phrase", "translation": "translation in student's language if needed", "usage": "brief context"}],
  "vocabulary": [{"word": "English word", "translation": "translation if needed", "partOfSpeech": "noun/verb/etc"}],
  "explanations": ["2-3 paragraphs explaining key English language concepts"],
  "tips": ["3-5 tips for practicing or remembering this English content"]
}

The content should be appropriate for ${level} level English students and focus specifically on the title topic.`;

    // Call Replicate API
    const response = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        "Authorization": `Token ${REPLICATE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        version: MODEL_ID,
        input: {
          prompt: userPrompt,
          system_prompt: systemPrompt,
          max_tokens: 2048,
          temperature: 0.7,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Replicate API error:", errorData);
      throw new Error(`Replicate API error: ${JSON.stringify(errorData)}`);
    }

    const prediction = await response.json();
    console.log("Prediction created:", prediction.id);

    // Return the prediction ID and URLs for the client to poll
    return new Response(
      JSON.stringify({
        id: prediction.id,
        status: prediction.status,
        urls: {
          get: `https://api.replicate.com/v1/predictions/${prediction.id}`,
          cancel: prediction.urls?.cancel,
        }
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in generate-lesson-content function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
