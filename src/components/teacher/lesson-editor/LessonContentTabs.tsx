
import React, { useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { LessonFormValues } from './useLessonForm';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ManualLessonForm from '../ManualLessonForm';
import AILessonForm from '../AILessonForm';
import MediaAttachmentsTab from '../lesson/media/MediaAttachmentsTab';

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
  
  return (
    <Tabs defaultValue="content" value={activeTab} onValueChange={setActiveTab}>
      <TabsList className="grid w-full md:w-auto md:inline-grid grid-cols-2 px-0">
        <TabsTrigger value="content">Lesson Content</TabsTrigger>
        <TabsTrigger value="media">Media Attachments</TabsTrigger>
      </TabsList>
      
      <TabsContent value="content" className="mt-6">
        {lessonType === 'manual' ? (
          <ManualLessonForm form={form} lessonId={lessonId} />
        ) : (
          <AILessonForm form={form} title={form.watch('title')} />
        )}
      </TabsContent>
      
      <TabsContent value="media" className="mt-6">
        <MediaAttachmentsTab lessonId={lessonId} isEditMode={isEditMode} />
      </TabsContent>
    </Tabs>
  );
};

export default LessonContentTabs;
