
import React from 'react';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { UseLessonFormReturn } from './useLessonForm';
import LessonFormHeader from './LessonFormHeader';
import LessonFormBasicFields from './LessonFormBasicFields';
import LessonContentEditor from './LessonContentEditor';
import LessonPreviewPanel from './LessonPreviewPanel';

interface LessonEditorLayoutProps {
  form: UseLessonFormReturn;
  isEditMode: boolean;
  loading: boolean;
  saving: boolean;
  onBack: () => void;
}

const LessonEditorLayout: React.FC<LessonEditorLayoutProps> = ({
  form,
  isEditMode,
  loading,
  saving,
  onBack
}) => {
  if (loading) {
    return (
      <div className="container mx-auto p-8 flex justify-center">
        <p>Loading lesson...</p>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col gap-4 p-4">
      <LessonFormHeader 
        isEditMode={isEditMode} 
        saving={saving} 
        onBackClick={onBack}
      />
      
      <div className="flex-1 grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Left Panel - Editor */}
        <Card className="flex flex-col">
          <div className="p-6 border-b">
            <LessonFormBasicFields form={form} />
          </div>
          
          <ScrollArea className="flex-1 p-6">
            <LessonContentEditor form={form} />
          </ScrollArea>
        </Card>

        {/* Right Panel - Preview */}
        <Card className="flex flex-col">
          <ScrollArea className="flex-1">
            <LessonPreviewPanel 
              content={form.watch('content')}
              title={form.watch('title')}
              lessonId={isEditMode ? form.watch('id') : undefined}
            />
          </ScrollArea>
        </Card>
      </div>
    </div>
  );
};

export default LessonEditorLayout;
