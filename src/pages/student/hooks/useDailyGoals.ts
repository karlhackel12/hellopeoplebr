
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface DailyGoal {
  label: string;
  current: number;
  target: number;
  percentage: number;
}

export const useDailyGoals = () => {
  const { data: goals, isLoading } = useQuery({
    queryKey: ['student-daily-goals'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Get today's vocabulary practice
      const { data: dueItems, error: itemsError } = await supabase
        .from('spaced_repetition_stats')
        .select('id')
        .eq('user_id', user.id)
        .gte('review_date', today.toISOString());
      
      if (itemsError) throw itemsError;
      
      // Get today's voice practice
      const { data: voiceSessions, error: voiceError } = await supabase
        .from('voice_practice_sessions')
        .select('duration_seconds')
        .eq('user_id', user.id)
        .gte('started_at', today.toISOString())
        .not('duration_seconds', 'is', null);
      
      if (voiceError) throw voiceError;
      
      // Get today's completed lessons
      const { data: lessonProgress, error: lessonError } = await supabase
        .from('user_lesson_progress')
        .select('id')
        .eq('user_id', user.id)
        .eq('completed', true)
        .gte('completed_at', today.toISOString());
      
      if (lessonError) throw lessonError;
      
      // Calculate voice practice minutes
      const voiceMinutes = voiceSessions?.reduce((total, session) => {
        return total + (session.duration_seconds ? Math.floor(session.duration_seconds / 60) : 0);
      }, 0) || 0;
      
      const vocabularyGoal: DailyGoal = {
        label: 'Vocabulary Practice',
        current: dueItems?.length || 0,
        target: 20,
        percentage: Math.min(((dueItems?.length || 0) / 20) * 100, 100)
      };
      
      const voiceGoal: DailyGoal = {
        label: 'Voice Practice',
        current: voiceMinutes,
        target: 10,
        percentage: Math.min((voiceMinutes / 10) * 100, 100)
      };
      
      const lessonsGoal: DailyGoal = {
        label: 'Lessons',
        current: lessonProgress?.length || 0,
        target: 2,
        percentage: Math.min(((lessonProgress?.length || 0) / 2) * 100, 100)
      };
      
      return [vocabularyGoal, voiceGoal, lessonsGoal];
    }
  });
  
  return { goals, isLoading };
};
