
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { LessonFormValues } from '../lesson-editor/useLessonForm';
import { GeneratedLessonContent } from './types';
import ContentHeader from './components/ContentHeader';
import ContentEditor from './components/ContentEditor';
import ContentDisplay from './components/ContentDisplay';
import LessonMetricsCards from './components/LessonMetricsCards';

interface ContentPreviewProps {
  form: UseFormReturn<LessonFormValues>;
  generatedContent: GeneratedLessonContent;
  editMode: boolean;
  toggleEditMode: () => void;
}

const ContentPreview: React.FC<ContentPreviewProps> = ({
  form,
  generatedContent,
  editMode,
  toggleEditMode,
}) => {
  return (
    <div className="space-y-6">
      <ContentHeader 
        editMode={editMode} 
        toggleEditMode={toggleEditMode}
        contentSource={form.watch('contentSource')}
      />
      
      {editMode ? (
        <ContentEditor form={form} />
      ) : (
        <ContentDisplay content={form.watch('content')} />
      )}

      <LessonMetricsCards generatedContent={generatedContent} />
    </div>
  );
};

export default ContentPreview;
