
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useStudentStreak = () => {
  const { data: streak, isLoading } = useQuery({
    queryKey: ['student-streak'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      
      // Fetch user login streak from the database
      const { data, error } = await supabase
        .from('user_lesson_progress')
        .select('completed_at')
        .eq('user_id', user.id)
        .order('completed_at', { ascending: false });
      
      if (error) throw error;
      
      // Calculate streak based on continuous daily activity
      const streakCount = calculateStreak(data);
      
      return {
        streakCount,
        lastActive: data?.[0]?.completed_at || null
      };
    }
  });
  
  // Calculate streak based on consecutive daily activity
  const calculateStreak = (data: any[] | null) => {
    if (!data || data.length === 0) return 0;
    
    // Get unique dates of completed lessons in descending order
    const uniqueDates = [...new Set(
      data.map(item => new Date(item.completed_at).toDateString())
    )];
    
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    
    // If no activity today or yesterday, streak is broken
    if (uniqueDates[0] !== today && uniqueDates[0] !== yesterday) {
      return 0;
    }
    
    let streakCount = 1;
    let currentDate = new Date(uniqueDates[0]);
    
    // Count consecutive days with activity
    for (let i = 1; i < uniqueDates.length; i++) {
      const prevDate = new Date(currentDate);
      prevDate.setDate(prevDate.getDate() - 1);
      
      if (new Date(uniqueDates[i]).toDateString() === prevDate.toDateString()) {
        streakCount++;
        currentDate = prevDate;
      } else {
        break;
      }
    }
    
    return streakCount;
  };
  
  return { streak, isLoading };
};
