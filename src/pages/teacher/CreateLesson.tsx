
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

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
        toast.error('Authentication required', {
          description: 'You must be logged in to create lessons'
        });
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

      if (error) {
        console.error('Error saving lesson:', error);
        throw error;
      }
      
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
        <div className="mb-6 flex items-center justify-between">
          <div>
            <Button variant="ghost" onClick={handleBack} className="mb-2 p-0 -ml-2">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back to lessons
            </Button>
            <h1 className="text-2xl md:text-3xl font-bold">Create New Lesson</h1>
            <p className="text-muted-foreground mt-1">
              Choose your preferred method to create an English lesson
            </p>
          </div>
        </div>
        
        <Card className="mb-8 border border-border/40 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-xl">Lesson Creation Method</CardTitle>
            <CardDescription>
              Select how you want to create your lesson content
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LessonTypeSelector 
              selectedType={lessonType} 
              onSelectType={setLessonType} 
            />
          </CardContent>
        </Card>
        
        {lessonType === 'ai' && (
          <AILessonCreateForm 
            onSubmit={handleSaveLesson} 
            isLoading={saving} 
          />
        )}
        
        {lessonType === 'manual' && (
          <Card className="bg-card border border-border/40 shadow-sm">
            <CardContent className="p-6">
              <div className="text-center py-6">
                <h3 className="text-lg font-medium mb-3">Manual Lesson Editor</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Create your lesson from scratch with our powerful editor that gives you complete control over the content.
                </p>
                <Button 
                  onClick={() => {
                    // Create an empty lesson
                    handleSaveLesson({
                      title: 'Untitled Lesson',
                      content: '',
                      is_published: false,
                      contentSource: 'ai_generated',
                    });
                  }}
                  className="px-6"
                  disabled={saving}
                >
                  {saving ? 'Creating...' : 'Continue to Editor'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </TeacherLayout>
  );
};

export default CreateLesson;
