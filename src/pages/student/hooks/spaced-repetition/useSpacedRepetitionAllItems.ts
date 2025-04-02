
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useSpacedRepetitionAllItems = (userId: string | null | undefined) => {
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
            difficulty,
            next_review_date,
            question_id,
            lesson_id,
            question:quiz_questions(
              id,
              question_text,
              question_type,
              points,
              options:quiz_question_options(
                id,
                option_text,
                is_correct,
                order_index
              )
            ),
            lesson:lessons(
              id,
              title,
              content
            )
          `)
          .eq('user_id', userId)
          .order('next_review_date', { ascending: true });

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
