import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { VoicePracticeSession, VoicePracticeFeedback, VoiceConfidenceScore } from '@/types/voice';
import { AssignedLesson } from '@/types/lesson';

interface CreateSessionParams {
  lessonId?: string;
  topic: string;
  difficultyLevel: number;
  vocabularyItems?: string[];
  assignmentId?: string | null;
}

interface CompleteSessionParams {
  sessionId: string;
  durationSeconds: number;
  analyticsData?: any;
}

interface FeedbackParams {
  sessionId: string;
  feedbackText: string;
  pronunciationScore?: number;
  grammarScore?: number;
  fluencyScore?: number;
}

/**
 * Hook para gerenciar as práticas de voz
 * Fornece dados de sessões, lições atribuídas, feedback, estatísticas e mutações
 */
export const useVoicePractice = () => {
  const queryClient = useQueryClient();
  const [currentSession, setCurrentSession] = useState<VoicePracticeSession | null>(null);
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);

  // Mutation para criar uma nova sessão
  const createSessionMutation = useMutation({
    mutationFn: async (params: CreateSessionParams) => {
      const { data: authData } = await supabase.auth.getUser();
      if (!authData.user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('voice_practice_sessions')
        .insert({
          user_id: authData.user.id,
          lesson_id: params.lessonId,
          topic: params.topic,
          difficulty_level: params.difficultyLevel,
          started_at: new Date().toISOString(),
          vocabulary_used: params.vocabularyItems,
          assignment_id: params.assignmentId
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      setCurrentSession(data);
      setSessionStartTime(Date.now());
      toast.success('Sessão iniciada com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao criar sessão:', error);
      toast.error('Erro ao iniciar sessão');
    }
  });

  // Mutation para completar uma sessão
  const completeSessionMutation = useMutation({
    mutationFn: async (params: CompleteSessionParams) => {
      if (!currentSession) throw new Error('Nenhuma sessão ativa');

      const { data, error } = await supabase
        .from('voice_practice_sessions')
        .update({
          completed_at: new Date().toISOString(),
          duration_seconds: params.durationSeconds,
          analytics_data: params.analyticsData
        })
        .eq('id', currentSession.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      setCurrentSession(null);
      setSessionStartTime(null);
      toast.success('Sessão concluída com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['voice-practice-sessions'] });
    },
    onError: (error) => {
      console.error('Erro ao completar sessão:', error);
      toast.error('Erro ao concluir sessão');
    }
  });

  // Mutation para adicionar feedback
  const addFeedbackMutation = useMutation({
    mutationFn: async (params: FeedbackParams) => {
      const { data: authData } = await supabase.auth.getUser();
      if (!authData.user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('voice_practice_feedback')
        .insert({
          session_id: params.sessionId,
          feedback_text: params.feedbackText,
          pronunciation_score: params.pronunciationScore,
          grammar_score: params.grammarScore,
          fluency_score: params.fluencyScore,
          user_id: authData.user.id
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Feedback registrado com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['voice-practice-feedback'] });
    },
    onError: (error) => {
      console.error('Erro ao adicionar feedback:', error);
      toast.error('Erro ao registrar feedback');
    }
  });

  // Query para buscar histórico de sessões
  const { data: sessions, isLoading: isLoadingSessions } = useQuery({
    queryKey: ['voice-practice-sessions'],
    queryFn: async () => {
      const { data: authData } = await supabase.auth.getUser();
      if (!authData.user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('voice_practice_sessions')
        .select(`
          *,
          lesson:lessons(*)
        `)
        .eq('user_id', authData.user.id)
        .order('started_at', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  // Query para buscar feedback
  const { data: feedback, isLoading: isLoadingFeedback } = useQuery({
    queryKey: ['voice-practice-feedback'],
    queryFn: async () => {
      const { data: authData } = await supabase.auth.getUser();
      if (!authData.user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('voice_practice_feedback')
        .select('*')
        .eq('user_id', authData.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  // Função para criar uma nova sessão
  const createSession = (params: CreateSessionParams) => {
    createSessionMutation.mutate(params);
  };

  // Função para completar a sessão atual
  const completeSession = (analyticsData?: any) => {
    if (!currentSession || !sessionStartTime) return;

    const durationSeconds = Math.floor((Date.now() - sessionStartTime) / 1000);
    completeSessionMutation.mutate({
      sessionId: currentSession.id,
      durationSeconds,
      analyticsData
    });
  };

  // Função para adicionar feedback
  const addFeedback = (params: FeedbackParams) => {
    addFeedbackMutation.mutate(params);
  };

  return {
    currentSession,
    sessions,
    feedback,
    isLoadingSessions,
    isLoadingFeedback,
    createSession,
    completeSession,
    addFeedback
  };
};

// Função para calcular a duração média das sessões
function calculateAverageDuration(sessions?: VoicePracticeSession[]): number {
  if (!sessions || sessions.length === 0) return 0;
  
  const completedSessions = sessions.filter(s => s.completed_at && s.duration_seconds);
  if (completedSessions.length === 0) return 0;
  
  const totalDuration = completedSessions.reduce(
    (total, session) => total + (session.duration_seconds || 0), 
    0
  );
  
  return Math.round(totalDuration / completedSessions.length);
}

// Função para determinar o nível mais alto de dificuldade praticado
function calculateHighestDifficulty(sessions?: VoicePracticeSession[]): number {
  if (!sessions || sessions.length === 0) return 1;
  
  return Math.max(...sessions.map(s => s.difficulty_level));
}

// Função para calcular pontuações médias de feedback
function calculateAverageScores(feedback?: VoicePracticeFeedback[]): {
  overall: number;
  pronunciation: number;
  grammar: number;
  fluency: number;
  vocabulary: number;
} {
  if (!feedback || feedback.length === 0) {
    return {
      overall: 0,
      pronunciation: 0,
      grammar: 0,
      fluency: 0,
      vocabulary: 0
    };
  }
  
  let pronunciationTotal = 0;
  let pronunciationCount = 0;
  let grammarTotal = 0;
  let grammarCount = 0;
  let fluencyTotal = 0;
  let fluencyCount = 0;
  
  feedback.forEach(f => {
    if (f.pronunciation_score) {
      pronunciationTotal += f.pronunciation_score;
      pronunciationCount++;
    }
    
    if (f.grammar_score) {
      grammarTotal += f.grammar_score;
      grammarCount++;
    }
    
    if (f.fluency_score) {
      fluencyTotal += f.fluency_score;
      fluencyCount++;
    }
  });
  
  const pronunciation = pronunciationCount > 0 
    ? Math.round((pronunciationTotal / pronunciationCount) * 10) / 10 
    : 0;
    
  const grammar = grammarCount > 0 
    ? Math.round((grammarTotal / grammarCount) * 10) / 10 
    : 0;
    
  const fluency = fluencyCount > 0 
    ? Math.round((fluencyTotal / fluencyCount) * 10) / 10 
    : 0;
  
  // Calcular pontuação geral como média das três categorias
  const scoreCount = [pronunciation, grammar, fluency].filter(Boolean).length;
  const overall = scoreCount > 0
    ? Math.round(((pronunciation + grammar + fluency) / scoreCount) * 10) / 10
    : 0;
  
  return {
    overall,
    pronunciation,
    grammar,
    fluency,
    vocabulary: 0 // Valor de espaço reservado para futuras implementações
  };
} 