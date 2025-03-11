
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormField, FormItem, FormControl, FormMessage } from '@/components/ui/form';
import { LessonFormValues } from '../lesson-editor/useLessonForm';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Edit, Check, Book, FileText, MessageSquare } from 'lucide-react';
import { GeneratedLessonContent } from './types';

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
      <div className="flex justify-between items-center">
        <Badge variant="outline" className="px-2 py-1">
          AI Generated {form.watch('contentSource') === 'mixed' && '(Edited)'}
        </Badge>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={toggleEditMode}
        >
          {editMode ? (
            <>
              <Check className="mr-1 h-4 w-4" /> Done Editing
            </>
          ) : (
            <>
              <Edit className="mr-1 h-4 w-4" /> Edit Content
            </>
          )}
        </Button>
      </div>
      
      {editMode ? (
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
      ) : (
        <div className="border rounded-md p-4 max-h-[500px] overflow-y-auto">
          <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: form.watch('content').replace(/\n/g, '<br/>') }} />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Book className="h-4 w-4 mr-2" />
              English Vocabulary
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">
              {generatedContent.vocabulary.length} words included
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <MessageSquare className="h-4 w-4 mr-2" />
              Key English Phrases
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">
              {generatedContent.keyPhrases.length} phrases included
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <FileText className="h-4 w-4 mr-2" />
              Lesson Contents
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">
              {generatedContent.objectives.length} objectives, {generatedContent.explanations.length} explanations
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ContentPreview;
