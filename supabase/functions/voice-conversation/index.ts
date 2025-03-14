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

    const { 
      userTranscript, 
      conversationId, 
      lessonTopics = [], 
      vocabularyItems = [], 
      difficulty = 1,
      userId,
      markAsCompleted = false,
      lessonId = null
    } = await req.json();

    // If just marking as completed, update the conversation session
    if (markAsCompleted && conversationId && userId) {
      // Create Supabase client
      const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
      
      const supabaseAdmin = createClient(supabaseUrl, supabaseKey);
      
      // Update the conversation session as completed
      await supabaseAdmin
        .from('conversation_sessions')
        .update({ is_completed: true, completed_at: new Date().toISOString() })
        .eq('id', conversationId);
      
      // If there's a lessonId, also update the lesson progress
      if (lessonId) {
        // Check if there's an existing progress record
        const { data: existingProgress } = await supabaseAdmin
          .from('user_lesson_progress')
          .select('id')
          .eq('lesson_id', lessonId)
          .eq('user_id', userId)
          .maybeSingle();
        
        if (existingProgress) {
          // Update existing progress
          await supabaseAdmin
            .from('user_lesson_progress')
            .update({ 
              status: 'completed',
              updated_at: new Date().toISOString(),
              practice_completed: true
            })
            .eq('id', existingProgress.id);
        } else {
          // Insert new progress record
          await supabaseAdmin
            .from('user_lesson_progress')
            .insert({
              lesson_id: lessonId,
              user_id: userId,
              status: 'completed',
              practice_completed: true,
              is_required: true
            });
        }
      }
      
      return new Response(
        JSON.stringify({ 
          success: true,
          message: "Conversation practice marked as completed" 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    if (!userTranscript) {
      throw new Error('Missing required parameter: userTranscript');
    }

    // Fetch conversation history if continuing a conversation
    let messages = [];
    
    if (conversationId) {
      // Create Supabase client
      const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
      
      const supabaseAdmin = createClient(supabaseUrl, supabaseKey);
      
      const { data: historyData, error: historyError } = await supabaseAdmin
        .from('conversation_messages')
        .select('role, content')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });
      
      if (historyError) {
        throw new Error(`Error fetching conversation history: ${historyError.message}`);
      }
      
      if (historyData && historyData.length > 0) {
        messages = historyData.map(msg => ({ role: msg.role, content: msg.content }));
      }
    }

    // Build system prompt
    const systemPrompt = buildSystemPrompt(difficulty, lessonTopics, vocabularyItems);
    
    // Prepare messages for OpenAI API
    const apiMessages = [
      { role: 'system', content: systemPrompt },
      ...messages,
      { role: 'user', content: userTranscript }
    ];

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: apiMessages,
        temperature: 0.7,
        max_tokens: 500
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI API error: ${error}`);
    }

    const result = await response.json();
    const aiResponse = result.choices[0].message.content;
    
    // If there's a valid conversationId, store the messages
    let newConversationId = conversationId;
    
    if (userId) {
      // Create Supabase client
      const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
      
      const supabaseAdmin = createClient(supabaseUrl, supabaseKey);
      
      // If no conversationId, create a new conversation session
      if (!conversationId) {
        const { data: sessionData, error: sessionError } = await supabaseAdmin
          .from('conversation_sessions')
          .insert({
            user_id: userId,
            difficulty_level: difficulty,
            topic: lessonTopics.length > 0 ? lessonTopics[0] : 'General Conversation',
            vocabulary_used: vocabularyItems,
            is_required: lessonId ? true : false,
            lesson_id: lessonId
          })
          .select('id')
          .single();
        
        if (sessionError) {
          throw new Error(`Error creating conversation session: ${sessionError.message}`);
        }
        
        newConversationId = sessionData.id;
      }
      
      // Save user message
      await supabaseAdmin
        .from('conversation_messages')
        .insert({
          conversation_id: newConversationId,
          role: 'user',
          content: userTranscript
        });
      
      // Save AI response
      await supabaseAdmin
        .from('conversation_messages')
        .insert({
          conversation_id: newConversationId,
          role: 'assistant',
          content: aiResponse
        });
    }

    return new Response(
      JSON.stringify({
        response: aiResponse,
        conversationId: newConversationId
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (error) {
    console.error('Error in voice-conversation function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

function createClient(supabaseUrl, supabaseKey) {
  return {
    from: (table) => ({
      select: (columns) => ({
        eq: (column, value) => ({
          order: (column, { ascending }) => ({
            then: async (callback) => {
              const response = await fetch(`${supabaseUrl}/rest/v1/${table}?select=${columns}&${column}=eq.${value}&order=${column}.${ascending ? 'asc' : 'desc'}`, {
                headers: {
                  'apikey': supabaseKey,
                  'Authorization': `Bearer ${supabaseKey}`
                }
              });
              const data = await response.json();
              return { data, error: null };
            }
          }),
          maybeSingle: async () => {
            const response = await fetch(`${supabaseUrl}/rest/v1/${table}?select=${columns}&${column}=eq.${value}&limit=1`, {
              headers: {
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`
              }
            });
            const data = await response.json();
            return { data: data.length > 0 ? data[0] : null, error: null };
          }
        })
      }),
      insert: (row) => ({
        select: (column) => ({
          single: async () => {
            const response = await fetch(`${supabaseUrl}/rest/v1/${table}`, {
              method: 'POST',
              headers: {
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
              },
              body: JSON.stringify(row)
            });
            
            if (!response.ok) {
              const error = await response.text();
              return { data: null, error: { message: error } };
            }
            
            const data = await response.json();
            return { data: data[0], error: null };
          }
        })
      }),
      update: (updates) => ({
        eq: async (column, value) => {
          const response = await fetch(`${supabaseUrl}/rest/v1/${table}?${column}=eq.${value}`, {
            method: 'PATCH',
            headers: {
              'apikey': supabaseKey,
              'Authorization': `Bearer ${supabaseKey}`,
              'Content-Type': 'application/json',
              'Prefer': 'return=minimal'
            },
            body: JSON.stringify(updates)
          });
          
          if (!response.ok) {
            const error = await response.text();
            return { error: { message: error } };
          }
          
          return { error: null };
        }
      })
    })
  };
}

function buildSystemPrompt(difficulty, lessonTopics, vocabularyItems) {
  // Base instructions for the conversation agent
  let prompt = `You are a helpful English conversation partner for a language learner. 
Your goal is to have a natural conversation while helping them practice English.`;
  
  // Add difficulty-specific instructions
  if (difficulty === 1) {
    prompt += `\nThe student is a BEGINNER. Use simple vocabulary and short sentences. 
Be patient and encouraging. Speak slowly and clearly.
If they make mistakes, gently correct them in your response.`;
  } else if (difficulty === 2) {
    prompt += `\nThe student is at an INTERMEDIATE level. Use everyday vocabulary and 
natural expressions. Encourage them to expand their answers.
Occasionally use idioms and explain them if appropriate.`;
  } else {
    prompt += `\nThe student is ADVANCED. Challenge them with sophisticated vocabulary 
and complex sentence structures. Discuss topics in depth and ask thought-provoking questions.
Use idioms, cultural references, and advanced grammar structures.`;
  }
  
  // Add topic-specific guidance if provided
  if (lessonTopics && lessonTopics.length > 0) {
    prompt += `\n\nThe conversation should focus on these topics from their recent lessons:
- ${lessonTopics.join('\n- ')}`;
  }
  
  // Add vocabulary guidance if provided
  if (vocabularyItems && vocabularyItems.length > 0) {
    prompt += `\n\nTry to naturally incorporate these vocabulary items they're learning:
${vocabularyItems.join(', ')}`;
  }
  
  prompt += `\n\nAsk questions that encourage them to use vocabulary relevant to the topics. 
Keep the conversation flowing naturally. If they make grammatical errors, weave corrections 
into your responses subtly without explicitly pointing them out, unless they are a beginner.`;

  return prompt;
}
