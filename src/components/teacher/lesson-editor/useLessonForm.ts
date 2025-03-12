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
  estimated_minutes: z.coerce.number().int().min(1).optional(),
  is_published: z.boolean().default(false),
  contentSource: z.enum(['manual', 'ai_generated', 'mixed']).default('manual'),
  structuredContent: z.any().optional(),
  generationMetadata: z.any().optional(),
});

export type LessonFormValues = z.infer<typeof lessonFormSchema>;

export type UseLessonFormReturn = UseFormReturn<LessonFormValues> & {
  id?: string;
};

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
      estimated_minutes: 15,
      is_published: false,
      contentSource: 'manual',
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
          // Fix for type error: ensure contentSource is one of the expected values
          const contentSource = data.content_source as string;
          let validContentSource: 'manual' | 'ai_generated' | 'mixed' = 'manual';
          
          if (contentSource === 'ai_generated' || contentSource === 'mixed') {
            validContentSource = contentSource;
          }
          
          form.reset({
            title: data.title,
            content: data.content || '',
            estimated_minutes: data.estimated_minutes || 15,
            is_published: data.is_published,
            contentSource: validContentSource,
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
            estimated_minutes: values.estimated_minutes,
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
            estimated_minutes: values.estimated_minutes,
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
    form: { ...form, id },
    onSubmit,
    loading,
    saving,
    isEditMode,
    id
  };
};
