
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useUser = () => {
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

  return { userId };
};
