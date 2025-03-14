
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface VoicePracticeSession {
  id: string;
  lesson_id: string | null;
  topic: string;
  difficulty_level: number;
  started_at: string;
  completed_at: string | null;
  duration_seconds: number | null;
  lesson?: {
    id: string;
    title: string;
    content: string;
  } | null;
}

export interface VoicePracticeFeedback {
  id: string;
  session_id: string;
  feedback_text: string;
  pronunciation_score: number | null;
  grammar_score: number | null;
  fluency_score: number | null;
  created_at: string;
}

export interface VoiceConfidenceScore {
  id: string;
  overall_score: number;
  pronunciation_score: number;
  grammar_score: number;
  fluency_score: number;
  recorded_at: string;
}

export const useVoicePractice = () => {
  const queryClient = useQueryClient();
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        setUserId(data.user.id);
      }
    };
    
    fetchUser();
  }, []);

  // Fetch all voice practice sessions
  const { data: sessions, isLoading: isLoadingSessions } = useQuery({
    queryKey: ['voice-practice-sessions', userId],
    queryFn: async () => {
      if (!userId) return [];
      
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
          lesson:lessons(
            id,
            title,
            content
          )
        `)
        .eq('user_id', userId)
        .order('started_at', { ascending: false });
      
      if (error) {
        toast.error('Failed to fetch voice practice sessions');
        throw error;
      }
      
      return data || [];
    },
    enabled: !!userId
  });

  // Fetch confidence scores
  const { data: confidenceScores, isLoading: isLoadingScores } = useQuery({
    queryKey: ['voice-confidence-scores', userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from('voice_confidence_scores')
        .select('*')
        .eq('user_id', userId)
        .order('recorded_at', { ascending: false });
      
      if (error) {
        toast.error('Failed to fetch voice confidence scores');
        throw error;
      }
      
      return data || [];
    },
    enabled: !!userId
  });

  // Fetch latest feedback
  const { data: recentFeedback, isLoading: isLoadingFeedback } = useQuery({
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
        toast.error('Failed to fetch voice practice feedback');
        throw error;
      }
      
      return data || [];
    },
    enabled: !!userId
  });

  // Create a new session
  const createSessionMutation = useMutation({
    mutationFn: async ({ 
      lessonId, 
      topic,
      difficultyLevel 
    }: { 
      lessonId?: string,
      topic: string,
      difficultyLevel: number
    }) => {
      if (!userId) throw new Error('User is not authenticated');
      
      const { data, error } = await supabase
        .from('voice_practice_sessions')
        .insert({
          user_id: userId,
          lesson_id: lessonId || null,
          topic,
          difficulty_level: difficultyLevel
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['voice-practice-sessions'] });
    },
    onError: (error) => {
      console.error('Failed to create voice practice session:', error);
      toast.error('Failed to create voice practice session');
    }
  });

  // Complete a session
  const completeSessionMutation = useMutation({
    mutationFn: async ({ 
      sessionId,
      durationSeconds
    }: { 
      sessionId: string,
      durationSeconds: number
    }) => {
      if (!userId) throw new Error('User is not authenticated');
      
      const { data, error } = await supabase
        .from('voice_practice_sessions')
        .update({
          completed_at: new Date().toISOString(),
          duration_seconds: durationSeconds
        })
        .eq('id', sessionId)
        .eq('user_id', userId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['voice-practice-sessions'] });
    },
    onError: (error) => {
      console.error('Failed to complete voice practice session:', error);
      toast.error('Failed to complete voice practice session');
    }
  });

  // Add feedback
  const addFeedbackMutation = useMutation({
    mutationFn: async ({ 
      sessionId,
      feedbackText,
      pronunciationScore,
      grammarScore,
      fluencyScore
    }: { 
      sessionId: string,
      feedbackText: string,
      pronunciationScore?: number,
      grammarScore?: number,
      fluencyScore?: number
    }) => {
      if (!userId) throw new Error('User is not authenticated');
      
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
      console.error('Failed to add voice practice feedback:', error);
      toast.error('Failed to add voice practice feedback');
    }
  });

  // Record confidence score
  const recordConfidenceScoreMutation = useMutation({
    mutationFn: async ({ 
      overallScore,
      pronunciationScore,
      grammarScore,
      fluencyScore
    }: { 
      overallScore: number,
      pronunciationScore: number,
      grammarScore: number,
      fluencyScore: number
    }) => {
      if (!userId) throw new Error('User is not authenticated');
      
      const { data, error } = await supabase
        .from('voice_confidence_scores')
        .insert({
          user_id: userId,
          overall_score: overallScore,
          pronunciation_score: pronunciationScore,
          grammar_score: grammarScore,
          fluency_score: fluencyScore
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['voice-confidence-scores'] });
    },
    onError: (error) => {
      console.error('Failed to record voice confidence score:', error);
      toast.error('Failed to record voice confidence score');
    }
  });
  
  // Calculate average scores from confidence scores
  const averageScores = confidenceScores?.length ? {
    overall: parseFloat((confidenceScores.reduce((sum, score) => sum + score.overall_score, 0) / confidenceScores.length).toFixed(1)),
    pronunciation: parseFloat((confidenceScores.reduce((sum, score) => sum + score.pronunciation_score, 0) / confidenceScores.length).toFixed(1)),
    grammar: parseFloat((confidenceScores.reduce((sum, score) => sum + score.grammar_score, 0) / confidenceScores.length).toFixed(1)),
    fluency: parseFloat((confidenceScores.reduce((sum, score) => sum + score.fluency_score, 0) / confidenceScores.length).toFixed(1)),
  } : {
    overall: 0,
    pronunciation: 0,
    grammar: 0,
    fluency: 0
  };

  // Get stats
  const stats = {
    totalSessions: sessions?.length || 0,
    completedSessions: sessions?.filter(session => session.completed_at).length || 0,
    averageDuration: sessions?.filter(session => session.duration_seconds)
      .reduce((sum, session) => sum + (session.duration_seconds || 0), 0) / 
      (sessions?.filter(session => session.duration_seconds).length || 1),
    highestDifficulty: sessions?.reduce((max, session) => Math.max(max, session.difficulty_level), 0) || 0,
    averageScores
  };

  return {
    sessions,
    recentFeedback,
    confidenceScores,
    stats,
    isLoading: isLoadingSessions || isLoadingScores || isLoadingFeedback,
    createSession: createSessionMutation.mutate,
    completeSession: completeSessionMutation.mutate,
    addFeedback: addFeedbackMutation.mutate,
    recordConfidenceScore: recordConfidenceScoreMutation.mutate
  };
};
