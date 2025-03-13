
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

type LessonOption = {
  id: string;
  title: string;
};

export const useAvailableLessons = () => {
  const [lessons, setLessons] = useState<LessonOption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLessons = async () => {
      try {
        setLoading(true);
        const { data: user } = await supabase.auth.getUser();
        
        if (!user.user) {
          return;
        }

        const { data, error } = await supabase
          .from('lessons')
          .select('id, title')
          .eq('created_by', user.user.id)
          .eq('is_published', true)
          .order('title', { ascending: true });

        if (error) throw error;
        setLessons(data || []);
      } catch (error) {
        console.error('Error fetching lessons:', error);
        toast.error('Failed to load lessons');
      } finally {
        setLoading(false);
      }
    };

    fetchLessons();
  }, []);

  return { lessons, loading };
};
