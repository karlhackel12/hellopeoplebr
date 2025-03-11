
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { UseFormReturn } from 'react-hook-form';
import { LessonFormValues } from './LessonEditor';

interface ManualLessonFormProps {
  form: UseFormReturn<LessonFormValues>;
}

const ManualLessonForm: React.FC<ManualLessonFormProps> = ({ form }) => {
  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="content"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Lesson Content</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="Enter lesson content here..." 
                className="min-h-[300px] font-mono"
                {...field} 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <div className="text-sm text-muted-foreground">
        <p>Markdown formatting is supported:</p>
        <ul className="list-disc pl-5 mt-1">
          <li># Header 1, ## Header 2</li>
          <li>**bold text**, *italic text*</li>
          <li>- Bullet points</li>
          <li>1. Numbered lists</li>
        </ul>
      </div>
    </div>
  );
};

export default ManualLessonForm;
