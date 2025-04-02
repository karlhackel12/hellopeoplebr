
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export const useSpacedRepetitionAllItems = (userId: string | undefined) => {
  const [allItems, setAllItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAllItems = async () => {
      if (!userId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        
        const { data, error } = await supabase
          .from('spaced_repetition_items')
          .select(`
            id,
            front_text,
            back_text,
            item_type,
            created_at,
            last_reviewed_at,
            next_review_at,
            ease_factor,
            interval_days,
            question:json
          `)
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (error) {
          throw error;
        }

        setAllItems(data || []);
      } catch (error) {
        console.error('Error fetching all spaced repetition items:', error);
        toast.error('Erro ao carregar itens de repetição espaçada');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllItems();
  }, [userId]);

  return {
    allItems,
    isLoading,
  };
};
