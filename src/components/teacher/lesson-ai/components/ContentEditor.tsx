
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormField, FormItem, FormControl, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { LessonFormValues } from '../../lesson-editor/useLessonForm';

interface ContentEditorProps {
  form: UseFormReturn<LessonFormValues>;
}

const ContentEditor: React.FC<ContentEditorProps> = ({ form }) => {
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
};

export default ContentEditor;
