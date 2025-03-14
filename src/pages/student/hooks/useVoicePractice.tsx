
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
  vocabulary_used?: string[];
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
  user_id: string;
}

export interface VoiceConfidenceScore {
  id: string;
  overall_score: number;
  pronunciation_score: number;
  grammar_score: number;
  fluency_score: number;
  recorded_at: string;
}

export interface AssignedLessonForPractice {
  id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  status: string;
  lesson_id: string;
  lesson: {
    id: string;
    title: string;
    content: string;
  } | null;
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
          vocabulary_used,
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

  // Fetch assigned lessons that require conversation practice
  const { data: assignedLessons, isLoading: isLoadingAssignedLessons } = useQuery({
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
        toast.error('Failed to fetch assigned lessons for conversation practice');
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
      difficultyLevel,
      vocabularyItems = [],
      assignmentId = null
    }: { 
      lessonId?: string,
      topic: string,
      difficultyLevel: number,
      vocabularyItems?: string[],
      assignmentId?: string | null
    }) => {
      if (!userId) throw new Error('User is not authenticated');
      
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

      // If this is linked to an assignment, update the assignment status
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
      console.error('Failed to create voice practice session:', error);
      toast.error('Failed to create voice practice session');
    }
  });

  // Complete a session
  const completeSessionMutation = useMutation({
    mutationFn: async ({ 
      sessionId,
      durationSeconds,
      analyticsData = null
    }: { 
      sessionId: string,
      durationSeconds: number,
      analyticsData?: any
    }) => {
      if (!userId) throw new Error('User is not authenticated');
      
      // Get the session to check if it's assignment-related
      const { data: sessionData } = await supabase
        .from('voice_practice_sessions')
        .select('assignment_id, lesson_id')
        .eq('id', sessionId)
        .single();
      
      const assignmentId = sessionData?.assignment_id;
      
      // Update session
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
      
      // If this was an assignment-related session, update the assignment
      if (assignmentId) {
        await supabase
          .from('student_assignments')
          .update({ 
            status: 'completed',
            completed_at: new Date().toISOString()
          })
          .eq('id', assignmentId);
      }
      
      // Update lesson progress if applicable
      if (sessionData?.lesson_id) {
        await updateLessonProgress(sessionData.lesson_id);
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['voice-practice-sessions'] });
      queryClient.invalidateQueries({ queryKey: ['voice-practice-assigned-lessons'] });
    },
    onError: (error) => {
      console.error('Failed to complete voice practice session:', error);
      toast.error('Failed to complete voice practice session');
    }
  });

  // Update lesson progress helper function
  const updateLessonProgress = async (lessonId: string) => {
    if (!userId) return;
    
    // Check if there's an existing progress record
    const { data: existingProgress } = await supabase
      .from('user_lesson_progress')
      .select('id, status')
      .eq('lesson_id', lessonId)
      .eq('user_id', userId)
      .maybeSingle();
    
    if (existingProgress) {
      // Update existing progress
      await supabase
        .from('user_lesson_progress')
        .update({ 
          status: 'completed',
          completed_at: new Date().toISOString(),
          practice_completed: true
        })
        .eq('id', existingProgress.id);
    } else {
      // Insert new progress record
      await supabase
        .from('user_lesson_progress')
        .insert({
          lesson_id: lessonId,
          user_id: userId,
          status: 'completed',
          completed_at: new Date().toISOString(),
          practice_completed: true,
          is_required: true
        });
    }
  };

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
  
  // Calculate detailed analytics from feedback and scores
  const calculateDetailedStats = () => {
    if (!confidenceScores?.length && !recentFeedback?.length) {
      return {
        overall: 0,
        pronunciation: 0,
        grammar: 0,
        fluency: 0,
        vocabulary: 0
      };
    }
    
    // Combine data from both sources
    const allGrammarScores = [
      ...confidenceScores?.map(s => s.grammar_score) || [],
      ...recentFeedback?.filter(f => f.grammar_score).map(f => f.grammar_score as number) || []
    ];
    
    const allFluencyScores = [
      ...confidenceScores?.map(s => s.fluency_score) || [],
      ...recentFeedback?.filter(f => f.fluency_score).map(f => f.fluency_score as number) || []
    ];
    
    const allPronunciationScores = [
      ...confidenceScores?.map(s => s.pronunciation_score) || [],
      ...recentFeedback?.filter(f => f.pronunciation_score).map(f => f.pronunciation_score as number) || []
    ];
    
    // Calculate averages
    const grammar = allGrammarScores.length ? 
      parseFloat((allGrammarScores.reduce((sum, score) => sum + score, 0) / allGrammarScores.length).toFixed(1)) : 0;
    
    const fluency = allFluencyScores.length ? 
      parseFloat((allFluencyScores.reduce((sum, score) => sum + score, 0) / allFluencyScores.length).toFixed(1)) : 0;
    
    const pronunciation = allPronunciationScores.length ? 
      parseFloat((allPronunciationScores.reduce((sum, score) => sum + score, 0) / allPronunciationScores.length).toFixed(1)) : 0;
    
    // Calculate overall score
    const overall = [grammar, fluency, pronunciation].filter(Boolean).length ? 
      parseFloat(([grammar, fluency, pronunciation].reduce((sum, score) => sum + score, 0) / 
      [grammar, fluency, pronunciation].filter(Boolean).length).toFixed(1)) : 0;
    
    // Estimate vocabulary score (typically a function of overall scores)
    const vocabulary = overall ? parseFloat((overall * 0.9).toFixed(1)) : 0;
    
    return {
      overall,
      pronunciation,
      grammar,
      fluency,
      vocabulary
    };
  };

  // Get stats
  const stats = {
    totalSessions: sessions?.length || 0,
    completedSessions: sessions?.filter(session => session.completed_at).length || 0,
    averageDuration: sessions?.filter(session => session.duration_seconds)
      .reduce((sum, session) => sum + (session.duration_seconds || 0), 0) / 
      (sessions?.filter(session => session.duration_seconds).length || 1),
    highestDifficulty: sessions?.reduce((max, session) => Math.max(max, session.difficulty_level), 0) || 0,
    averageScores: calculateDetailedStats(),
    assignedPractices: assignedLessons?.length || 0
  };

  // Filter required sessions that are in progress or not started
  const requiredSessions = sessions
    ?.filter(session => session.lesson && !session.completed_at) || [];

  // Get assigned lessons that don't already have a voice practice session
  const assignedLessonsWithoutSessions = assignedLessons?.filter(assignment => 
    assignment.lesson_id && 
    !sessions?.some(session => 
      session.lesson_id === assignment.lesson_id && !session.completed_at
    )
  ) || [];

  return {
    sessions,
    recentFeedback,
    confidenceScores,
    stats,
    requiredSessions,
    assignedLessonsWithoutSessions,
    isLoading: isLoadingSessions || isLoadingScores || isLoadingFeedback || isLoadingAssignedLessons,
    createSession: createSessionMutation.mutate,
    completeSession: completeSessionMutation.mutate,
    addFeedback: addFeedbackMutation.mutate,
    recordConfidenceScore: recordConfidenceScoreMutation.mutate
  };
};
