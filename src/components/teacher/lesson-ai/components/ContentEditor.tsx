
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormField, FormItem, FormControl, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { LessonFormValues } from '../../lesson-editor/useLessonForm';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GeneratedLessonContent } from '../types';

interface ContentEditorProps {
  form: UseFormReturn<LessonFormValues>;
}

const ContentEditor: React.FC<ContentEditorProps> = ({ form }) => {
  const structuredContent = form.watch('structuredContent') as GeneratedLessonContent | null;
  
  const handleContentChange = (field: keyof GeneratedLessonContent, value: any) => {
    if (!structuredContent) return;
    
    const updatedContent = {
      ...structuredContent,
      [field]: value
    };
    
    form.setValue('structuredContent', updatedContent);
    form.setValue('contentSource', 'mixed');
    
    // Update the markdown content based on the structured content
    const formattedContent = formatStructuredContent(updatedContent, form.watch('title'));
    form.setValue('content', formattedContent);
  };
  
  const formatStructuredContent = (content: GeneratedLessonContent, title: string): string => {
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

  if (!structuredContent) {
    return (
      <FormField
        control={form.control}
        name="content"
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <Textarea 
                className="min-h-[400px] font-mono"
                {...field} 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="structured" className="w-full">
        <TabsList className="w-full grid grid-cols-2">
          <TabsTrigger value="structured">Structured Editor</TabsTrigger>
          <TabsTrigger value="markdown">Markdown</TabsTrigger>
        </TabsList>
        
        <TabsContent value="structured" className="mt-4">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea 
                  value={structuredContent.description}
                  onChange={(e) => handleContentChange('description', e.target.value)}
                  className="min-h-[100px]"
                />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Learning Objectives</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea 
                  value={structuredContent.objectives.join('\n')}
                  onChange={(e) => handleContentChange('objectives', e.target.value.split('\n').filter(line => line.trim() !== ''))}
                  className="min-h-[100px]"
                  placeholder="Add each objective on a new line"
                />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Practical Situations</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea 
                  value={structuredContent.practicalSituations.join('\n')}
                  onChange={(e) => handleContentChange('practicalSituations', e.target.value.split('\n').filter(line => line.trim() !== ''))}
                  className="min-h-[100px]"
                  placeholder="Add each situation on a new line"
                />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Explanations</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea 
                  value={structuredContent.explanations.join('\n\n')}
                  onChange={(e) => handleContentChange('explanations', e.target.value.split('\n\n').filter(line => line.trim() !== ''))}
                  className="min-h-[150px]"
                  placeholder="Add each explanation with a blank line between them"
                />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Tips</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea 
                  value={structuredContent.tips.join('\n')}
                  onChange={(e) => handleContentChange('tips', e.target.value.split('\n').filter(line => line.trim() !== ''))}
                  className="min-h-[100px]"
                  placeholder="Add each tip on a new line"
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="markdown" className="mt-4">
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Textarea 
                    className="min-h-[400px] font-mono"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ContentEditor;
