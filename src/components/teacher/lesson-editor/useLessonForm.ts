
import { useState, useEffect } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from 'sonner';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

// Define form validation schema
export const lessonFormSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters" }),
  content: z.string().min(10, { message: "Content must be at least 10 characters" }),
  is_published: z.boolean().default(false),
  contentSource: z.enum(['ai_generated']).default('ai_generated'),
  structuredContent: z.any().optional(),
  generationMetadata: z.any().optional(),
});

export type LessonFormValues = z.infer<typeof lessonFormSchema>;

export const useLessonForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const isEditMode = !!id;

  // Initialize form
  const form = useForm<LessonFormValues>({
    resolver: zodResolver(lessonFormSchema),
    defaultValues: {
      title: '',
      content: '',
      is_published: false,
      contentSource: 'ai_generated',
      structuredContent: null,
      generationMetadata: null,
    },
  });

  // Load existing lesson if in edit mode
  useEffect(() => {
    const fetchLesson = async () => {
      if (!isEditMode) return;
      
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('lessons')
          .select('*')
          .eq('id', id)
          .single();
        
        if (error) throw error;
        
        if (data) {
          form.reset({
            title: data.title,
            content: data.content || '',
            is_published: data.is_published,
            contentSource: 'ai_generated',
            structuredContent: data.structured_content,
            generationMetadata: data.generation_metadata,
          });
        }
      } catch (error) {
        console.error('Error fetching lesson:', error);
        toast.error('Error', {
          description: 'Failed to load lesson',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchLesson();
  }, [id, navigate, form, isEditMode]);

  // Save lesson
  const onSubmit = async (values: LessonFormValues) => {
    setSaving(true);
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        navigate('/login');
        return;
      }

      if (isEditMode) {
        // Update existing lesson
        const { error } = await supabase
          .from('lessons')
          .update({
            title: values.title,
            content: values.content,
            is_published: values.is_published,
            content_source: values.contentSource,
            structured_content: values.structuredContent,
            generation_metadata: values.generationMetadata,
            updated_at: new Date().toISOString(),
          })
          .eq('id', id);

        if (error) throw error;
        
        toast.success('Lesson updated', {
          description: 'Your lesson has been successfully updated',
        });
      } else {
        // Create new lesson
        const { data, error } = await supabase
          .from('lessons')
          .insert({
            title: values.title,
            content: values.content,
            is_published: values.is_published,
            content_source: values.contentSource,
            structured_content: values.structuredContent,
            generation_metadata: values.generationMetadata,
            created_by: user.user.id,
            order_index: 0, // Default order, can be adjusted later
          })
          .select();

        if (error) throw error;
        
        toast.success('Lesson created', {
          description: 'Your lesson has been successfully created',
        });

        // Navigate to edit mode with the new lesson ID
        if (data && data.length > 0) {
          navigate(`/teacher/lessons/edit/${data[0].id}`);
        } else {
          navigate('/teacher/lessons');
        }
      }
    } catch (error) {
      console.error('Error saving lesson:', error);
      toast.error('Error', {
        description: 'Failed to save lesson',
      });
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
    id
  };
};
