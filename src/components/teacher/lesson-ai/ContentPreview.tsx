
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { LessonFormValues } from '../lesson-editor/useLessonForm';
import { GeneratedLessonContent } from './types';
import ContentHeader from './components/ContentHeader';
import ContentEditor from './components/ContentEditor';
import ContentDisplay from './components/ContentDisplay';
import LessonMetricsCards from './components/LessonMetricsCards';
import { Button } from '@/components/ui/button';
import { formatContent } from './contentUtils';

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
  const handleResetToAI = () => {
    if (window.confirm('Are you sure you want to reset to the original AI-generated content? All your edits will be lost.')) {
      // Reset content to original AI-generated content
      form.setValue('structuredContent', generatedContent);
      form.setValue('contentSource', 'ai_generated');
      
      // Rebuild the markdown content
      const formattedContent = formatContent(generatedContent, form.watch('title'));
      form.setValue('content', formattedContent);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <ContentHeader 
          editMode={editMode} 
          toggleEditMode={toggleEditMode}
          contentSource={form.watch('contentSource')}
        />
        
        <div className="flex gap-2">
          {form.watch('contentSource') === 'mixed' && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleResetToAI}
            >
              Reset to AI Version
            </Button>
          )}
        </div>
      </div>
      
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
