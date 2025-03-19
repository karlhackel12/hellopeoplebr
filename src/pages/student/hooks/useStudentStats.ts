
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useStudentStats = () => {
  const { data: stats, isLoading } = useQuery({
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
    }
  });
  
  return { stats, isLoading };
};
