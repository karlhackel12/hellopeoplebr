
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { LessonFormValues } from '../lesson-editor/useLessonForm';
import { GeneratedLessonContent } from './types';
import ContentHeader from './components/ContentHeader';
import ContentEditor from './components/ContentEditor';
import ContentDisplay from './components/ContentDisplay';
import LessonMetricsCards from './components/LessonMetricsCards';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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
  const [activeView, setActiveView] = React.useState<'edit' | 'preview'>('edit');

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

  const formatContent = (content: GeneratedLessonContent, title: string): string => {
    let formattedContent = `# ${title}\n\n`;
    
    formattedContent += `## Description\n${content.description}\n\n`;
    
    formattedContent += `## Learning Objectives\n`;
    content.objectives.forEach(objective => {
      formattedContent += `- ${objective}\n`;
    });
    formattedContent += '\n';
    
    formattedContent += `## Practical Situations\n`;
    content.practicalSituations.forEach(situation => {
      formattedContent += `- ${situation}\n`;
    });
    formattedContent += '\n';
    
    formattedContent += `## Key Phrases\n`;
    content.keyPhrases.forEach(phrase => {
      formattedContent += `- **${phrase.phrase}** - ${phrase.translation}\n  *Usage: ${phrase.usage}*\n`;
    });
    formattedContent += '\n';
    
    formattedContent += `## Vocabulary\n`;
    content.vocabulary.forEach(word => {
      formattedContent += `- **${word.word}** (${word.partOfSpeech}) - ${word.translation}\n`;
    });
    formattedContent += '\n';
    
    formattedContent += `## Explanations\n`;
    content.explanations.forEach(explanation => {
      formattedContent += `${explanation}\n\n`;
    });
    
    formattedContent += `## Tips\n`;
    content.tips.forEach(tip => {
      formattedContent += `- ${tip}\n`;
    });
    
    return formattedContent;
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
        <Tabs defaultValue="content" className="w-full">
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="student-view">
              <Eye className="h-4 w-4 mr-1" /> Student View
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="content" className="mt-4">
            <ContentDisplay content={form.watch('content')} />
          </TabsContent>
          
          <TabsContent value="student-view" className="mt-4">
            <iframe 
              src={`/teacher/lessons/preview?content=${encodeURIComponent(form.watch('content'))}&title=${encodeURIComponent(form.watch('title'))}`}
              className="w-full h-[600px] border rounded-md"
              title="Student View"
            />
          </TabsContent>
        </Tabs>
      )}

      <LessonMetricsCards generatedContent={generatedContent} />
    </div>
  );
};

export default ContentPreview;
