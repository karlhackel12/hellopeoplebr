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

    const { conversationId } = await req.json();

    if (!conversationId) {
      throw new Error('Missing required parameter: conversationId');
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    
    // Get conversation messages
    const { data: messages, error: messagesError } = await fetch(
      `${supabaseUrl}/rest/v1/conversation_messages?conversation_id=eq.${conversationId}&order=created_at.asc`,
      {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`
        }
      }
    ).then(res => res.json());
    
    if (messagesError) {
      throw new Error(`Error fetching conversation messages: ${messagesError}`);
    }

    if (!messages || messages.length === 0) {
      throw new Error('No messages found for this conversation');
    }

    // Extract user messages for analysis
    const userMessages = messages.filter(msg => msg.role === 'user');
    const messageTexts = userMessages.map(msg => msg.content).join('\n\n');

    // Call OpenAI for analysis
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `Você é um tutor de idiomas especializado em análise de conversação em inglês.
                     Analise as mensagens do aluno e forneça métricas detalhadas sobre:
                     1. Vocabulário:
                        - Palavras únicas usadas
                        - Variedade de vocabulário (0-10)
                        - Uso apropriado de palavras
                     2. Gramática:
                        - Correção gramatical (0-10)
                        - Estrutura das frases
                        - Erros comuns identificados
                     3. Fluência:
                        - Naturalidade da fala (0-10)
                        - Ritmo e entonação
                        - Hesitações e pausas
                     4. Tópicos:
                        - Relevância do conteúdo
                        - Desenvolvimento do tópico
                        - Interação e engajamento
                     5. Habilidades gerais:
                        - Pontuação geral (0-10)
                        - Pontos fortes
                        - Áreas para melhoria
                     
                     Responda com um objeto JSON contendo estas métricas e sugestões específicas de melhoria.`
          },
          {
            role: 'user',
            content: `Aqui estão as mensagens do aluno em uma prática de conversação:\n\n${messageTexts}`
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI API error: ${error}`);
    }

    const analysisResult = await response.json();
    const analysis = JSON.parse(analysisResult.choices[0].message.content);
    
    // Validar e estruturar os dados de análise
    const analysisData = {
      vocabulary: {
        uniqueWords: analysis.vocabulary?.uniqueWords || 0,
        variety: analysis.vocabulary?.variety || 0,
        usage: analysis.vocabulary?.usage || 0
      },
      grammar: {
        score: analysis.grammar?.score || 0,
        structure: analysis.grammar?.structure || 0,
        errors: analysis.grammar?.errors || []
      },
      fluency: {
        score: analysis.fluency?.score || 0,
        rhythm: analysis.fluency?.rhythm || 0,
        hesitations: analysis.fluency?.hesitations || 0
      },
      topics: {
        relevance: analysis.topics?.relevance || 0,
        development: analysis.topics?.development || 0,
        engagement: analysis.topics?.engagement || 0
      },
      overall: {
        score: analysis.overall?.score || 0,
        strengths: analysis.overall?.strengths || [],
        improvements: analysis.overall?.improvements || []
      }
    };

    // Calcular pontuação geral ponderada
    const overallScore = Math.round(
      (analysisData.vocabulary.variety * 0.2 +
       analysisData.grammar.score * 0.3 +
       analysisData.fluency.score * 0.3 +
       analysisData.topics.relevance * 0.2)
    );

    // Atualizar a pontuação de confiança
    await supabaseAdmin
      .from('voice_confidence_scores')
      .insert({
        user_id: userId,
        overall_score: overallScore,
        pronunciation_score: analysisData.fluency.score,
        grammar_score: analysisData.grammar.score,
        fluency_score: analysisData.fluency.score,
        recorded_at: new Date().toISOString()
      });

    return new Response(
      JSON.stringify({
        success: true,
        analysis: analysisData,
        overallScore,
        feedback: {
          strengths: analysisData.overall.strengths,
          improvements: analysisData.overall.improvements,
          nextSteps: generateNextSteps(analysisData)
        }
      }),
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

// Função auxiliar para gerar próximos passos baseados na análise
function generateNextSteps(analysis: any) {
  const steps = [];
  
  if (analysis.vocabulary.variety < 7) {
    steps.push('Tente usar mais palavras diferentes e expandir seu vocabulário');
  }
  
  if (analysis.grammar.score < 7) {
    steps.push('Foque em estruturas gramaticais mais complexas e precisão');
  }
  
  if (analysis.fluency.score < 7) {
    steps.push('Pratique a fala mais natural e reduza hesitações');
  }
  
  if (analysis.topics.engagement < 7) {
    steps.push('Tente manter a conversa mais engajada e desenvolver melhor os tópicos');
  }
  
  return steps;
}
