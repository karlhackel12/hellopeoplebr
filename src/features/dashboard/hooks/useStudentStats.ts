import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';

export const useStudentStats = () => {
  const queryClient = useQueryClient();
  
  const { data: stats, isLoading, refetch } = useQuery({
    queryKey: ['student-stats'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      
      // Get completed lessons count
      const { data: lessonProgress, error: lessonError } = await supabase
        .from('user_lesson_progress')
        .select('lesson_id, completed, completed_at')
        .eq('user_id', user.id)
        .eq('completed', true);
      
      if (lessonError) throw lessonError;
      
      // Get total learning time from voice practice sessions
      const { data: voiceSessions, error: voiceError } = await supabase
        .from('voice_practice_sessions')
        .select('duration_seconds')
        .eq('user_id', user.id)
        .not('duration_seconds', 'is', null);
      
      if (voiceError) throw voiceError;
      
      // Calculate total minutes spent learning
      const voiceMinutes = voiceSessions?.reduce((total, session) => {
        return total + (session.duration_seconds ? Math.floor(session.duration_seconds / 60) : 0);
      }, 0) || 0;
      
      // Estimate 10 minutes per completed lesson
      const lessonMinutes = (lessonProgress?.length || 0) * 10;
      
      return {
        lessonsCompleted: lessonProgress?.length || 0,
        totalMinutes: voiceMinutes + lessonMinutes
      };
    },
    staleTime: 60 * 1000, // Reduzido para 1 minuto
    refetchOnWindowFocus: true,
    refetchOnMount: true
  });
  
  // Atualizações automáticas a cada 2 minutos
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 2 * 60 * 1000); // 2 minutos
    
    return () => clearInterval(interval);
  }, [refetch]);
  
  // Configurar subscriptions para atualizações em tempo real
  useEffect(() => {
    // Escutar mudanças na tabela de progresso das lições
    const lessonSubscription = supabase
      .channel('lesson-progress-changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'user_lesson_progress' 
      }, () => {
        queryClient.invalidateQueries({ queryKey: ['student-stats'] });
      })
      .subscribe();
      
    // Escutar mudanças nas sessões de prática de voz
    const voiceSubscription = supabase
      .channel('voice-session-changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'voice_practice_sessions' 
      }, () => {
        queryClient.invalidateQueries({ queryKey: ['student-stats'] });
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(lessonSubscription);
      supabase.removeChannel(voiceSubscription);
    };
  }, [queryClient]);
  
  return { 
    stats, 
    isLoading,
    refetch
  };
};
