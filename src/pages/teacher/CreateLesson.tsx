
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TeacherLayout from '@/components/layout/TeacherLayout';
import AILessonCreateForm from '@/components/teacher/lesson-ai/AILessonCreateForm';
import LessonTypeSelector from '@/components/teacher/LessonTypeSelector';
import { LessonFormValues } from '@/components/teacher/lesson-editor/useLessonForm';
import { useIsMobile } from '@/hooks/use-mobile';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatContent } from '@/components/teacher/lesson-ai/contentUtils';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const CreateLesson: React.FC = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [lessonType, setLessonType] = useState<'manual' | 'ai'>('ai');
  const [saving, setSaving] = useState(false);
  
  const handleBack = () => {
    navigate('/teacher/lessons');
  };
  
  const handleSaveLesson = async (values: LessonFormValues) => {
    setSaving(true);
    try {
      // Format content from structured content if available
      if (values.structuredContent) {
        const formattedContent = formatContent(values.structuredContent, values.title);
        values.content = formattedContent;
      }

      // Check if user is authenticated
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        navigate('/login');
        return;
      }

      // Create new lesson
      const { data, error } = await supabase
        .from('lessons')
        .insert({
          title: values.title,
          content: values.content,
          is_published: values.is_published || false,
          content_source: values.contentSource || 'ai_generated',
          structured_content: values.structuredContent || null,
          generation_metadata: values.generationMetadata || null,
          estimated_minutes: values.estimated_minutes || 15,
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
    } catch (error) {
      console.error('Error saving lesson:', error);
      toast.error('Error', {
        description: 'Failed to save lesson',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <TeacherLayout>
      <div className="container mx-auto p-4 md:p-8">
        <div className="mb-6">
          <Button variant="ghost" onClick={handleBack} className="mb-4 p-0">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to lessons
          </Button>
          <h1 className="text-2xl md:text-3xl font-bold">Create New Lesson</h1>
        </div>
        
        <div className="mb-8">
          <LessonTypeSelector 
            selectedType={lessonType} 
            onSelectType={setLessonType} 
          />
        </div>
        
        {lessonType === 'ai' && (
          <AILessonCreateForm 
            onSubmit={handleSaveLesson} 
            isLoading={saving} 
          />
        )}
        
        {lessonType === 'manual' && (
          <div className="bg-muted p-6 rounded-lg text-center">
            <p className="text-muted-foreground">
              Manual lesson creation will redirect you to the editor after the lesson is created.
            </p>
            <Button 
              onClick={() => {
                // Create an empty lesson
                handleSaveLesson({
                  title: 'Untitled Lesson',
                  content: '',
                  is_published: false,
                  contentSource: 'manual',
                });
              }}
              className="mt-4"
              disabled={saving}
            >
              Continue to Editor
            </Button>
          </div>
        )}
      </div>
    </TeacherLayout>
  );
};

export default CreateLesson;
