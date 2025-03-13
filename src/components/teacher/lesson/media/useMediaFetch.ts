
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useMediaFetch = (lessonId?: string) => {
  const [media, setMedia] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMedia = async () => {
    if (!lessonId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('lesson_media')
        .select('*')
        .eq('lesson_id', lessonId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMedia(data || []);
    } catch (error) {
      console.error('Error fetching media:', error);
      toast.error('Failed to load media attachments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, [lessonId]);

  return {
    media,
    loading,
    fetchMedia
  };
};

export default useMediaFetch;
