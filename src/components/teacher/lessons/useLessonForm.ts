
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

// Define schema for the form
const lessonFormSchema = z.object({
  title: z.string().min(3, { message: 'Title must be at least 3 characters' }).max(100),
  content: z.string().optional(),
  contentSource: z.enum(['manual', 'ai_generated', 'mixed']).default('manual'),
  isPublished: z.boolean().default(false),
  generatedContent: z.string().optional(),
  contentPrompt: z.string().optional(),
  contentTopic: z.string().optional(),
  contentLevel: z.string().optional(),
  contentStyle: z.string().optional(),
  contentLength: z.string().optional(),
});

export type LessonFormValues = z.infer<typeof lessonFormSchema>;

export const useLessonForm = (lessonId?: string, isEditMode: boolean = false) => {
  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  // Initialize form with default values
  const form = useForm<LessonFormValues>({
    resolver: zodResolver(lessonFormSchema),
    defaultValues: {
      title: '',
      content: '',
      contentSource: 'manual',
      isPublished: false,
      generatedContent: '',
      contentPrompt: '',
      contentTopic: '',
      contentLevel: 'beginner',
      contentStyle: 'informative',
      contentLength: 'medium',
    },
  });

  // Load lesson data from database if in edit mode
  useEffect(() => {
    if (isEditMode && lessonId) {
      const fetchLesson = async () => {
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
              title: data.title || '',
              content: data.content || '',
              contentSource: data.content_source || 'manual',
              isPublished: data.is_published || false,
              generatedContent: data.generated_content || '',
              contentPrompt: data.content_prompt || '',
              contentTopic: data.content_topic || '',
              contentLevel: data.content_level || 'beginner',
              contentStyle: data.content_style || 'informative',
              contentLength: data.content_length || 'medium',
            });
          }
        } catch (error) {
          console.error('Error fetching lesson:', error);
          toast.error('Failed to load lesson');
        } finally {
          setLoading(false);
        }
      };

      fetchLesson();
    }
  }, [isEditMode, lessonId, form]);

  // Form submission handler
  const onSubmit = async (values: LessonFormValues) => {
    try {
      setSaving(true);
      
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        toast.error('You must be logged in');
        return;
      }

      if (isEditMode && lessonId) {
        // Update existing lesson
        const { error } = await supabase
          .from('lessons')
          .update({
            title: values.title,
            content: values.content,
            content_source: values.contentSource,
            is_published: values.isPublished,
            generated_content: values.generatedContent,
            content_prompt: values.contentPrompt,
            content_topic: values.contentTopic,
            content_level: values.contentLevel,
            content_style: values.contentStyle,
            content_length: values.contentLength,
            updated_at: new Date().toISOString(),
          })
          .eq('id', lessonId);

        if (error) throw error;
        toast.success('Lesson updated successfully');
        
        // Don't navigate away after update
      } else {
        // Create new lesson
        const { data, error } = await supabase
          .from('lessons')
          .insert({
            title: values.title,
            content: values.content,
            content_source: values.contentSource,
            is_published: values.isPublished,
            generated_content: values.generatedContent,
            content_prompt: values.contentPrompt,
            content_topic: values.contentTopic,
            content_level: values.contentLevel,
            content_style: values.contentStyle,
            content_length: values.contentLength,
            created_by: user.user.id,
          })
          .select('id')
          .single();

        if (error) throw error;
        toast.success('Lesson created successfully');
        
        // Navigate to edit mode for the new lesson
        if (data && data.id) {
          navigate(`/teacher/lessons/edit/${data.id}`);
        }
      }
    } catch (error) {
      console.error('Error saving lesson:', error);
      toast.error('Failed to save lesson');
    } finally {
      setSaving(false);
    }
  };

  return {
    form,
    onSubmit,
    loading,
    saving,
    isEditMode,
    id: lessonId,
  };
};
