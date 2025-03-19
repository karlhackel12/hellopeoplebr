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
  const [userId, setUserId] = useState<string | null>(null);

  // Buscar o ID do usuário autenticado
  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        setUserId(data.user.id);
      }
    };
    
    fetchUser();
  }, []);

  // Buscar as sessões de prática de voz
  const { data: sessions, isLoading: isLoadingSessions } = useQuery<VoicePracticeSession[]>({
    queryKey: ['voice-practice-sessions', userId],
    queryFn: async () => {
      if (!userId) return [];
      
      try {
        const { data, error } = await supabase
          .from('voice_practice_sessions')
          .select(`
            id,
            lesson_id,
            topic,
            difficulty_level,
            started_at,
            completed_at,
            duration_seconds,
            vocabulary_used,
            assignment_id,
            analytics_data,
            lesson:lessons(
              id,
              title,
              content
            )
          `)
          .eq('user_id', userId)
          .order('started_at', { ascending: false });
        
        if (error) {
          console.error('Erro ao buscar sessões de prática de voz:', error);
          toast.error('Falha ao buscar sessões de prática de voz');
          return [];
        }
        
        return data || [];
      } catch (err) {
        console.error('Exceção ao buscar sessões de prática de voz:', err);
        toast.error('Falha ao buscar sessões de prática de voz');
        return [];
      }
    },
    enabled: !!userId
  });

  // Buscar as lições atribuídas ao aluno
  const { data: assignedLessons, isLoading: isLoadingAssignedLessons } = useQuery<AssignedLesson[]>({
    queryKey: ['voice-practice-assigned-lessons', userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from('student_assignments')
        .select(`
          id,
          title,
          description,
          due_date,
          status,
          lesson_id,
          lesson:lessons(
            id,
            title,
            content
          )
        `)
        .eq('student_id', userId)
        .not('lesson_id', 'is', null)
        .in('status', ['not_started', 'in_progress'])
        .order('due_date', { ascending: true });
      
      if (error) {
        toast.error('Falha ao buscar lições atribuídas para prática de conversação');
        throw error;
      }
      
      return data || [];
    },
    enabled: !!userId
  });

  // Buscar pontuações de confiança
  const { data: confidenceScores, isLoading: isLoadingScores } = useQuery<VoiceConfidenceScore[]>({
    queryKey: ['voice-confidence-scores', userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from('voice_confidence_scores')
        .select('*')
        .eq('user_id', userId)
        .order('recorded_at', { ascending: false });
      
      if (error) {
        toast.error('Falha ao buscar pontuações de confiança de voz');
        throw error;
      }
      
      return data || [];
    },
    enabled: !!userId
  });

  // Buscar feedback recente
  const { data: recentFeedback, isLoading: isLoadingFeedback } = useQuery<VoicePracticeFeedback[]>({
    queryKey: ['voice-practice-feedback', userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from('voice_practice_feedback')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (error) {
        toast.error('Falha ao buscar feedback de prática de voz');
        throw error;
      }
      
      return data || [];
    },
    enabled: !!userId
  });

  // Estatísticas da prática
  const stats = {
    totalSessions: sessions?.length || 0,
    completedSessions: sessions?.filter(s => s.completed_at).length || 0,
    averageDuration: calculateAverageDuration(sessions),
    highestDifficulty: calculateHighestDifficulty(sessions),
    averageScores: calculateAverageScores(recentFeedback),
    assignedPractices: assignedLessons?.length || 0
  };

  // Mutação para criar uma nova sessão
  const createSessionMutation = useMutation({
    mutationFn: async ({
      lessonId,
      topic,
      difficultyLevel,
      vocabularyItems = [],
      assignmentId = null
    }: CreateSessionParams) => {
      if (!userId) throw new Error('Usuário não autenticado');
      
      const { data, error } = await supabase
        .from('voice_practice_sessions')
        .insert({
          user_id: userId,
          lesson_id: lessonId || null,
          topic,
          difficulty_level: difficultyLevel,
          vocabulary_used: vocabularyItems,
          assignment_id: assignmentId
        })
        .select()
        .single();
      
      if (error) throw error;

      if (assignmentId) {
        await supabase
          .from('student_assignments')
          .update({ status: 'in_progress' })
          .eq('id', assignmentId);
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['voice-practice-sessions'] });
      queryClient.invalidateQueries({ queryKey: ['voice-practice-assigned-lessons'] });
    },
    onError: (error) => {
      console.error('Falha ao criar sessão de prática de voz:', error);
      toast.error('Falha ao criar sessão de prática de voz');
    }
  });

  // Mutação para completar uma sessão
  const completeSessionMutation = useMutation({
    mutationFn: async ({
      sessionId,
      durationSeconds,
      analyticsData = null
    }: CompleteSessionParams) => {
      if (!userId) throw new Error('Usuário não autenticado');
      
      try {
        const { data: sessionData, error: sessionError } = await supabase
          .from('voice_practice_sessions')
          .select('assignment_id, lesson_id')
          .eq('id', sessionId)
          .single();
          
        if (sessionError) {
          console.error('Erro ao buscar dados da sessão:', sessionError);
          throw sessionError;
        }
        
        const assignmentId = sessionData?.assignment_id;
        
        const { data, error } = await supabase
          .from('voice_practice_sessions')
          .update({
            completed_at: new Date().toISOString(),
            duration_seconds: durationSeconds,
            analytics_data: analyticsData
          })
          .eq('id', sessionId)
          .eq('user_id', userId)
          .select()
          .single();
        
        if (error) throw error;
        
        if (assignmentId) {
          await supabase
            .from('student_assignments')
            .update({ 
              status: 'completed',
              completed_at: new Date().toISOString()
            })
            .eq('id', assignmentId);
        }
        
        if (sessionData?.lesson_id) {
          await updateLessonProgress(sessionData.lesson_id);
        }
        
        return data;
      } catch (error) {
        console.error('Erro ao completar sessão:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['voice-practice-sessions'] });
      queryClient.invalidateQueries({ queryKey: ['voice-practice-assigned-lessons'] });
      queryClient.invalidateQueries({ queryKey: ['student-progress'] });
      queryClient.invalidateQueries({ queryKey: ['user-lesson-progress'] });
    },
    onError: (error) => {
      console.error('Falha ao completar sessão de prática de voz:', error);
      toast.error('Falha ao completar sessão de prática de voz');
    }
  });

  // Mutação para adicionar feedback
  const addFeedbackMutation = useMutation({
    mutationFn: async ({
      sessionId,
      feedbackText,
      pronunciationScore,
      grammarScore,
      fluencyScore
    }: FeedbackParams) => {
      if (!userId) throw new Error('Usuário não autenticado');
      
      const { data, error } = await supabase
        .from('voice_practice_feedback')
        .insert({
          user_id: userId,
          session_id: sessionId,
          feedback_text: feedbackText,
          pronunciation_score: pronunciationScore || null,
          grammar_score: grammarScore || null,
          fluency_score: fluencyScore || null
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['voice-practice-feedback'] });
    },
    onError: (error) => {
      console.error('Falha ao adicionar feedback de prática de voz:', error);
      toast.error('Falha ao adicionar feedback de prática de voz');
    }
  });

  // Função auxiliar para atualizar o progresso da lição
  const updateLessonProgress = async (lessonId: string) => {
    if (!userId) return;
    
    try {
      // Verificar se já existe um registro de progresso
      const { data: existingProgress } = await supabase
        .from('user_lesson_progress')
        .select('id, status, practice_completed')
        .eq('lesson_id', lessonId)
        .eq('user_id', userId)
        .maybeSingle();
      
      if (existingProgress) {
        // Atualizar progresso existente
        await supabase
          .from('user_lesson_progress')
          .update({ 
            practice_completed: true,
            status: existingProgress.status === 'completed' 
              ? 'completed' 
              : 'in_progress',
            updated_at: new Date().toISOString()
          })
          .eq('id', existingProgress.id);
      } else {
        // Inserir novo registro de progresso
        await supabase
          .from('user_lesson_progress')
          .insert({
            lesson_id: lessonId,
            user_id: userId,
            status: 'in_progress',
            practice_completed: true,
            progress_percentage: 50
          });
      }
    } catch (error) {
      console.error('Erro ao atualizar progresso da lição:', error);
    }
  };

  return {
    sessions,
    recentFeedback,
    confidenceScores,
    stats,
    assignedLessons,
    isLoadingSessions,
    isLoadingFeedback,
    isLoadingScores,
    isLoadingAssignedLessons,
    createSession: createSessionMutation.mutateAsync,
    completeSession: completeSessionMutation.mutateAsync,
    addFeedback: addFeedbackMutation.mutateAsync
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