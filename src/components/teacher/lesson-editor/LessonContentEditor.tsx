
import React from 'react';
import { UseLessonFormReturn } from './useLessonForm';
import { FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PencilLine, Eye } from 'lucide-react';
import ContentDisplay from '../lesson-ai/components/ContentDisplay';

interface LessonContentEditorProps {
  form: UseLessonFormReturn;
}

const LessonContentEditor: React.FC<LessonContentEditorProps> = ({ form }) => {
  return (
    <Card className="border-none shadow-none">
      <CardHeader className="px-0 pt-0">
        <CardTitle>Lesson Content</CardTitle>
      </CardHeader>
      <CardContent className="px-0">
        <Tabs defaultValue="edit">
          <TabsList>
            <TabsTrigger value="edit" className="flex items-center gap-2">
              <PencilLine className="h-4 w-4" /> Edit
            </TabsTrigger>
            <TabsTrigger value="preview" className="flex items-center gap-2">
              <Eye className="h-4 w-4" /> Preview
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="edit">
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea 
                      {...field}
                      className="min-h-[400px] font-mono"
                      placeholder="Enter your lesson content in markdown..."
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </TabsContent>
          
          <TabsContent value="preview">
            <div className="border rounded-md">
              <ContentDisplay content={form.watch('content')} />
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default LessonContentEditor;
