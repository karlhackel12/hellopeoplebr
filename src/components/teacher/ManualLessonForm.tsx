
import React, { useState } from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { UseFormReturn } from 'react-hook-form';
import { LessonFormValues } from './lesson-editor/useLessonForm';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bold, Italic, List, ListOrdered, Heading2, Image, FileText } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { LessonPreview } from './LessonPreview';

interface ManualLessonFormProps {
  form: UseFormReturn<LessonFormValues>;
}

const ManualLessonForm: React.FC<ManualLessonFormProps> = ({ form }) => {
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  const insertMarkdown = (markdownSyntax: string, placeholder: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selectedText = text.substring(start, end);
    
    let newText;
    if (selectedText) {
      newText = text.substring(0, start) + 
                markdownSyntax.replace('$1', selectedText) + 
                text.substring(end);
    } else {
      newText = text.substring(0, start) + 
                markdownSyntax.replace('$1', placeholder) + 
                text.substring(end);
    }
    
    form.setValue('content', newText, { shouldDirty: true });
    
    setTimeout(() => {
      if (textarea) {
        const newCursorPos = selectedText 
          ? start + markdownSyntax.indexOf('$1') + selectedText.length 
          : start + markdownSyntax.replace('$1', placeholder).length;
        textarea.focus();
        textarea.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 0);
  };

  const handleBold = () => insertMarkdown('**$1**', 'bold text');
  const handleItalic = () => insertMarkdown('*$1*', 'italic text');
  const handleBulletList = () => insertMarkdown('\n- $1', 'List item');
  const handleNumberedList = () => insertMarkdown('\n1. $1', 'List item');
  const handleHeading = () => insertMarkdown('\n## $1', 'Heading');
  const handleAddImage = () => insertMarkdown('\n![Image description]($1)', 'image-url');

  const insertTemplate = (templateType: string) => {
    let template = '';
    
    switch(templateType) {
      case 'vocabulary':
        template = '\n## English Vocabulary\n\n' +
                  '- **word1** - definition or translation\n' +
                  '- **word2** - definition or translation\n' +
                  '- **word3** - definition or translation\n';
        break;
      case 'grammar':
        template = '\n## English Grammar Rule\n\n' +
                  '### Structure\n' +
                  'Explain the grammar structure here\n\n' +
                  '### Examples\n' +
                  '1. Example sentence one\n' +
                  '2. Example sentence two\n';
        break;
      case 'conversation':
        template = '\n## English Conversation Practice\n\n' +
                  '**Person A**: First line of dialogue\n\n' +
                  '**Person B**: Response to first line\n\n' +
                  '**Person A**: Another line of dialogue\n';
        break;
      case 'pronunciation':
        template = '\n## Pronunciation Guide\n\n' +
                  '- **Word**: How to pronounce it\n' +
                  '- **Word**: How to pronounce it\n' +
                  '- **Difficult sounds**: Tips for producing these sounds\n';
        break;
      case 'exercise':
        template = '\n## Practice Exercise\n\n' +
                  '1. Question one\n' +
                  '2. Question two\n' +
                  '3. Question three\n';
        break;
    }
    
    const currentContent = form.getValues('content');
    const newContent = currentContent + template;
    form.setValue('content', newContent, { shouldDirty: true });
  };

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as 'edit' | 'preview')}>
        <TabsList className="w-full md:w-auto md:inline-grid grid-cols-2">
          <TabsTrigger value="edit">
            <FileText className="h-4 w-4 mr-1" /> Editor
          </TabsTrigger>
          <TabsTrigger value="preview">
            <Image className="h-4 w-4 mr-1" /> Preview
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="edit" className="mt-6">
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2 p-2 bg-muted rounded-md">
              <Button type="button" variant="ghost" size="sm" onClick={handleBold}>
                <Bold className="h-4 w-4" />
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={handleItalic}>
                <Italic className="h-4 w-4" />
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={handleHeading}>
                <Heading2 className="h-4 w-4" />
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={handleBulletList}>
                <List className="h-4 w-4" />
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={handleNumberedList}>
                <ListOrdered className="h-4 w-4" />
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={handleAddImage}>
                <Image className="h-4 w-4" />
              </Button>
              
              <div className="ml-auto flex items-center space-x-2">
                <span className="text-xs text-muted-foreground">English Templates:</span>
                <select 
                  className="text-xs py-1 px-2 rounded border bg-background" 
                  onChange={(e) => {
                    if (e.target.value) {
                      insertTemplate(e.target.value);
                      e.target.value = '';
                    }
                  }}
                  defaultValue=""
                >
                  <option value="" disabled>Insert template</option>
                  <option value="vocabulary">English Vocabulary List</option>
                  <option value="grammar">English Grammar Rule</option>
                  <option value="conversation">English Conversation</option>
                  <option value="pronunciation">Pronunciation Guide</option>
                  <option value="exercise">Practice Exercise</option>
                </select>
              </div>
            </div>
            
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>English Lesson Content</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Enter English lesson content here..." 
                      className="min-h-[400px] font-mono resize-y"
                      {...field} 
                      ref={textareaRef}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="text-sm text-muted-foreground">
              <p>Markdown formatting guide:</p>
              <div className="grid grid-cols-2 mt-1 gap-x-4 gap-y-1">
                <div className="text-xs"># Header 1</div>
                <div className="text-xs">## Header 2</div>
                <div className="text-xs">**bold text**</div>
                <div className="text-xs">*italic text*</div>
                <div className="text-xs">- Bullet points</div>
                <div className="text-xs">1. Numbered lists</div>
                <div className="text-xs">[Link text](url)</div>
                <div className="text-xs">![Alt text](image-url)</div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-medium text-sm mb-2">Connect Media</h3>
                  <p className="text-xs text-muted-foreground mb-3">Add English audio and images from your library into your lesson</p>
                  <Button type="button" variant="outline" className="w-full" size="sm" disabled>
                    <Image className="h-4 w-4 mr-2" /> Select Media
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2">
                    Save the lesson first to enable media selection
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-medium text-sm mb-2">Estimated Reading Time</h3>
                  <p className="text-xs text-muted-foreground">Based on current content:</p>
                  <p className="text-lg font-bold">{Math.max(1, Math.ceil(form.watch('content').length / 1000))} min</p>
                  <p className="text-xs text-muted-foreground">
                    {form.watch('content').split(/\s+/).filter(Boolean).length} words
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="preview" className="mt-6">
          <LessonPreview content={form.watch('content')} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ManualLessonForm;
