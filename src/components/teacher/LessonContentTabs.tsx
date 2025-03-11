
import React, { useState, useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { LessonFormValues } from './lesson-editor/useLessonForm';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ManualLessonForm from '../teacher/ManualLessonForm';
import AILessonForm from '../teacher/AILessonForm';
import MediaAttachmentsTab from '../MediaAttachmentsTab';
import QuizTab from '../QuizTab';
import { supabase } from '@/integrations/supabase/client';

interface LessonContentTabsProps {
  form: UseFormReturn<LessonFormValues>;
  lessonId?: string;
  isEditMode: boolean;
  lessonType: 'manual' | 'ai';
}

const LessonContentTabs: React.FC<LessonContentTabsProps> = ({
  form,
  lessonId,
  isEditMode,
  lessonType
}) => {
  const [activeTab, setActiveTab] = useState('content');
  const [mediaCount, setMediaCount] = useState(0);

  // Fetch media count for badge
  useEffect(() => {
    if (lessonId) {
      const fetchMediaCount = async () => {
        try {
          const { count, error } = await supabase
            .from('lesson_media')
            .select('*', { count: 'exact', head: true })
            .eq('lesson_id', lessonId);
          
          if (error) throw error;
          setMediaCount(count || 0);
        } catch (error) {
          console.error('Error fetching media count:', error);
        }
      };

      fetchMediaCount();
    }
  }, [lessonId, activeTab]);

  return (
    <Tabs defaultValue="content" value={activeTab} onValueChange={setActiveTab}>
      <TabsList className="grid w-full md:w-auto md:inline-grid grid-cols-3">
        <TabsTrigger value="content">Lesson Content</TabsTrigger>
        <TabsTrigger value="media">
          Media Attachments
          {mediaCount > 0 && (
            <span className="ml-1.5 inline-flex items-center justify-center h-5 w-5 text-xs bg-primary text-primary-foreground rounded-full">
              {mediaCount}
            </span>
          )}
        </TabsTrigger>
        <TabsTrigger value="quiz">Quiz</TabsTrigger>
      </TabsList>
      <TabsContent value="content" className="mt-6">
        {lessonType === 'manual' ? (
          <ManualLessonForm form={form} lessonId={lessonId} />
        ) : (
          <AILessonForm 
            form={form}
            title={form.watch('title')}
          />
        )}
      </TabsContent>
      <TabsContent value="media" className="mt-6">
        <MediaAttachmentsTab lessonId={lessonId} isEditMode={isEditMode} />
      </TabsContent>
      <TabsContent value="quiz" className="mt-6">
        <QuizTab lessonId={lessonId} isEditMode={isEditMode} />
      </TabsContent>
    </Tabs>
  );
};

export default LessonContentTabs;
