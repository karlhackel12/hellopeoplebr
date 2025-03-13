
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

// Lesson form schema
const lessonFormSchema = z.object({
  title: z.string().min(1, { message: 'Title is required' }),
  estimated_minutes: z.coerce.number().min(1, { message: 'Estimated minutes must be at least 1' }),
  content: z.string().optional(),
  is_published: z.boolean().default(false),
  content_source: z.enum(['manual', 'ai_generated', 'mixed']),
});

export type LessonFormValues = z.infer<typeof lessonFormSchema>;

interface UseLessonFormProps {
  lessonId?: string;
  onSave?: (lessonId: string) => void;
}

export const useLessonForm = ({ lessonId, onSave }: UseLessonFormProps = {}) => {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(!!lessonId);
  const isEditMode = !!lessonId;

  // Initialize form
  const form = useForm<LessonFormValues>({
    resolver: zodResolver(lessonFormSchema),
    defaultValues: {
      title: '',
      estimated_minutes: 10,
      content: '',
      is_published: false,
      content_source: 'manual',
    },
  });

  // Load existing lesson data if in edit mode
  useEffect(() => {
    const fetchLesson = async () => {
      if (!lessonId) return;

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('lessons')
          .select('*')
          .eq('id', lessonId)
          .single();

        if (error) throw error;
        
        if (data) {
          form.reset({
            title: data.title,
            estimated_minutes: data.estimated_minutes,
            content: data.content || '',
            is_published: data.is_published,
            content_source: data.content_source as 'manual' | 'ai_generated' | 'mixed',
          });
        }
      } catch (error: any) {
        console.error('Error loading lesson:', error);
        toast.error('Failed to load lesson', {
          description: error.message,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchLesson();
  }, [lessonId, form]);

  // Handle form submission
  const onSubmit = async (values: LessonFormValues) => {
    try {
      setSaving(true);
      
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) {
        throw new Error('Not authenticated');
      }

      const lessonData = {
        title: values.title,
        estimated_minutes: values.estimated_minutes,
        content: values.content || '',
        is_published: values.is_published,
        content_source: values.content_source,
      };

      let response;
      
      if (isEditMode) {
        // Update existing lesson
        response = await supabase
          .from('lessons')
          .update(lessonData)
          .eq('id', lessonId)
          .select()
          .single();
      } else {
        // Create new lesson
        response = await supabase
          .from('lessons')
          .insert({
            ...lessonData,
            created_by: userData.user.id,
          })
          .select()
          .single();
      }

      if (response.error) throw response.error;
      
      const savedLessonId = response.data.id;
      
      toast.success(`Lesson ${isEditMode ? 'updated' : 'created'} successfully`, {
        description: values.title,
      });

      if (onSave) {
        onSave(savedLessonId);
      } else {
        navigate('/teacher/lessons');
      }
      
    } catch (error: any) {
      console.error('Error saving lesson:', error);
      toast.error(`Failed to ${isEditMode ? 'update' : 'create'} lesson`, {
        description: error.message,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    navigate('/teacher/lessons');
  };

  return {
    form,
    isEditMode,
    loading,
    saving,
    onSubmit,
    handleBack,
  };
};
