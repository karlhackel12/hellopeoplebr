
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
    const { conversationId, userId } = await req.json();

    if (!conversationId || !userId) {
      throw new Error('Missing required parameters: conversationId and userId');
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseKey);
    
    // Fetch conversation messages
    const { data: messagesData, error: messagesError } = await supabaseAdmin
      .from('conversation_messages')
      .select('role, content, created_at')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });
    
    if (messagesError) {
      throw new Error(`Error fetching conversation messages: ${messagesError.message}`);
    }
    
    // Analyze user messages
    const userMessages = messagesData.filter(m => m.role === 'user');
    const aiMessages = messagesData.filter(m => m.role === 'assistant');
    
    if (userMessages.length === 0) {
      throw new Error('No user messages found in this conversation');
    }

    // Basic analysis metrics
    const userWordCount = userMessages.reduce((acc, msg) => {
      return acc + (msg.content.match(/\b\w+\b/g) || []).length;
    }, 0);
    
    const uniqueWords = new Set();
    userMessages.forEach(msg => {
      const words = msg.content.toLowerCase().match(/\b\w+\b/g) || [];
      words.forEach(word => uniqueWords.add(word));
    });
    
    const vocabularyDiversity = Math.min(10, (uniqueWords.size / userWordCount) * 10);
    
    const averageResponseTime = calculateAverageResponseTime(userMessages, aiMessages);
    
    // Calculate user's approximate speaking time
    const userSpeakingTime = userMessages.length * 15; // Rough estimate: 15 seconds per message
    
    // Simple grammar quality score based on message complexity
    const grammarQuality = calculateGrammarQuality(userMessages);
    
    // Calculate fluency score
    const fluencyScore = calculateFluencyScore(userMessages, userWordCount);
    
    // Save analytics to database
    const { data: analyticsData, error: analyticsError } = await supabaseAdmin
      .from('conversation_analytics')
      .insert({
        user_id: userId,
        conversation_id: conversationId,
        vocabulary_count: uniqueWords.size,
        vocabulary_diversity: Math.round(vocabularyDiversity),
        grammar_quality: Math.round(grammarQuality),
        fluency_score: Math.round(fluencyScore),
        user_speaking_time_seconds: userSpeakingTime
      })
      .select()
      .single();
    
    if (analyticsError) {
      throw new Error(`Error saving analytics: ${analyticsError.message}`);
    }
    
    // Prepare result
    const result = {
      conversationId,
      messageCount: messagesData.length,
      userMessageCount: userMessages.length,
      aiMessageCount: aiMessages.length,
      vocabularyCount: uniqueWords.size,
      vocabularyDiversity: Math.round(vocabularyDiversity * 10) / 10,
      grammarQuality: Math.round(grammarQuality * 10) / 10,
      fluencyScore: Math.round(fluencyScore * 10) / 10,
      userSpeakingTime: userSpeakingTime,
      averageResponseTime: Math.round(averageResponseTime)
    };

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (error) {
    console.error('Error in analyze-conversation function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

// Helper function to create a simple Supabase client
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
          })
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
      })
    })
  };
}

// Helper function to calculate average response time
function calculateAverageResponseTime(userMessages, aiMessages) {
  let totalResponseTime = 0;
  let responseCount = 0;
  
  // Skip the first AI message (it's usually the greeting)
  for (let i = 1; i < aiMessages.length; i++) {
    const aiMessageTime = new Date(aiMessages[i].created_at).getTime();
    
    // Find the last user message before this AI message
    for (let j = userMessages.length - 1; j >= 0; j--) {
      const userMessageTime = new Date(userMessages[j].created_at).getTime();
      if (userMessageTime < aiMessageTime) {
        totalResponseTime += (aiMessageTime - userMessageTime) / 1000; // Convert to seconds
        responseCount++;
        break;
      }
    }
  }
  
  return responseCount > 0 ? totalResponseTime / responseCount : 0;
}

// Helper function to estimate grammar quality
function calculateGrammarQuality(userMessages) {
  let totalScore = 0;
  
  userMessages.forEach(msg => {
    const content = msg.content;
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    // Score based on average sentence length (more complex sentences = higher score)
    const avgWordsPerSentence = sentences.length > 0
      ? sentences.reduce((acc, s) => acc + (s.match(/\b\w+\b/g) || []).length, 0) / sentences.length
      : 0;
    
    // Score based on vocabulary complexity (longer words = higher score)
    const words = content.match(/\b\w+\b/g) || [];
    const avgWordLength = words.length > 0
      ? words.reduce((acc, w) => acc + w.length, 0) / words.length
      : 0;
    
    // Score based on use of punctuation (more punctuation = higher score)
    const punctuationCount = (content.match(/[,;:()"\-]|'s/g) || []).length;
    const punctuationScore = words.length > 0 ? (punctuationCount / words.length) * 5 : 0;
    
    // Combine scores (weighted)
    const messageScore = (avgWordsPerSentence * 0.4) + (avgWordLength * 0.4) + (punctuationScore * 0.2);
    totalScore += messageScore;
  });
  
  // Average score across messages, scaled to 0-10
  const rawScore = userMessages.length > 0 ? totalScore / userMessages.length : 0;
  
  // Scale to 0-10 (these values may need adjustment)
  return Math.min(10, Math.max(0, rawScore * 1.5));
}

// Helper function to estimate fluency score
function calculateFluencyScore(userMessages, totalWordCount) {
  if (userMessages.length === 0) return 0;
  
  // Average words per message (higher = more fluent)
  const avgWordsPerMessage = totalWordCount / userMessages.length;
  
  // Variation in message length (lower = more consistent = more fluent)
  const messageLengths = userMessages.map(msg => 
    (msg.content.match(/\b\w+\b/g) || []).length
  );
  
  const avgLength = messageLengths.reduce((a, b) => a + b, 0) / messageLengths.length;
  const variance = messageLengths.reduce((a, b) => a + Math.pow(b - avgLength, 2), 0) / messageLengths.length;
  const stdDev = Math.sqrt(variance);
  const coefficientOfVariation = stdDev / avgLength;
  
  // Response time between messages (consistent = more fluent)
  const messageTimes = userMessages.map(msg => new Date(msg.created_at).getTime());
  let timeScores = [];
  
  for (let i = 1; i < messageTimes.length; i++) {
    const timeDiff = (messageTimes[i] - messageTimes[i-1]) / 1000; // Seconds
    // Score better for responses between 5-30 seconds (not too rushed, not too hesitant)
    const timeScore = timeDiff < 5 ? 5 : timeDiff > 30 ? Math.max(0, 10 - (timeDiff - 30) / 10) : 10;
    timeScores.push(timeScore);
  }
  
  const avgTimeScore = timeScores.length > 0 
    ? timeScores.reduce((a, b) => a + b, 0) / timeScores.length 
    : 5; // Default mid-score if only one message
  
  // Calculate final score
  // Word count per message (30% weight)
  const wordCountScore = Math.min(10, avgWordsPerMessage / 2);
  
  // Consistency (35% weight)
  const consistencyScore = Math.min(10, 10 - coefficientOfVariation * 5);
  
  // Response timing (35% weight)
  const timingScore = avgTimeScore;
  
  return (wordCountScore * 0.3) + (consistencyScore * 0.35) + (timingScore * 0.35);
}
