
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Process base64 in chunks to prevent memory issues
function processBase64Chunks(base64String: string, chunkSize = 32768) {
  const chunks: Uint8Array[] = [];
  let position = 0;
  
  while (position < base64String.length) {
    const chunk = base64String.slice(position, position + chunkSize);
    const binaryChunk = atob(chunk);
    const bytes = new Uint8Array(binaryChunk.length);
    
    for (let i = 0; i < binaryChunk.length; i++) {
      bytes[i] = binaryChunk.charCodeAt(i);
    }
    
    chunks.push(bytes);
    position += chunkSize;
  }

  const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;

  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }

  return result;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const path = url.pathname.split('/').pop();
    
    if (path === 'transcribe') {
      return handleTranscribe(req, corsHeaders);
    } else if (path === 'chat') {
      return handleChat(req, corsHeaders);
    } else if (path === 'speech') {
      return handleSpeech(req, corsHeaders);
    } else {
      return new Response(
        JSON.stringify({ error: 'Invalid endpoint' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
  } catch (error) {
    console.error('Error in voice service function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

async function handleTranscribe(req: Request, corsHeaders: Record<string, string>) {
  const { audioData, model, language, promptBoost, prompt } = await req.json();
  
  if (!audioData) {
    throw new Error('No audio data provided');
  }
  
  // Process audio in chunks
  const binaryAudio = new Uint8Array(audioData);
  
  // Prepare form data
  const formData = new FormData();
  const blob = new Blob([binaryAudio], { type: 'audio/webm' });
  formData.append('file', blob, 'audio.webm');
  formData.append('model', model || 'whisper-1');
  if (language) formData.append('language', language);
  if (promptBoost) formData.append('prompt_boost', String(promptBoost));
  if (prompt) formData.append('prompt', prompt);

  // Send to OpenAI
  const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${await response.text()}`);
  }

  const result = await response.json();

  return new Response(
    JSON.stringify({ 
      text: result.text,
      confidence: 0.9,
      segments: [result.text]
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function handleChat(req: Request, corsHeaders: Record<string, string>) {
  const { messages, model, temperature, systemPrompt } = await req.json();
  
  if (!messages || !Array.isArray(messages)) {
    throw new Error('Invalid or missing messages');
  }
  
  // Prepare request body
  const requestBody: any = {
    model: model || 'gpt-4',
    messages: [],
    temperature: temperature || 0.7,
  };
  
  // Add system prompt if provided
  if (systemPrompt) {
    requestBody.messages.push({
      role: 'system',
      content: systemPrompt
    });
  }
  
  // Add all messages
  requestBody.messages.push(...messages);
  
  // Call OpenAI API
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${await response.text()}`);
  }

  const result = await response.json();
  
  return new Response(
    JSON.stringify({
      text: result.choices[0]?.message?.content || '',
      model: result.model,
      tokensUsed: result.usage?.total_tokens || 0
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function handleSpeech(req: Request, corsHeaders: Record<string, string>) {
  const { text, voice, model, speed } = await req.json();
  
  if (!text) {
    throw new Error('Text is required');
  }
  
  // Call OpenAI API for speech synthesis
  const response = await fetch('https://api.openai.com/v1/audio/speech', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: model || 'tts-1',
      input: text,
      voice: voice || 'nova',
      speed: speed || 1.0,
      response_format: 'mp3',
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${await response.text()}`);
  }

  // Convert audio buffer to base64
  const arrayBuffer = await response.arrayBuffer();
  const base64Audio = btoa(
    String.fromCharCode(...new Uint8Array(arrayBuffer))
  );
  
  return new Response(
    JSON.stringify({ 
      audioData: base64Audio,
      format: 'mp3'
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}
