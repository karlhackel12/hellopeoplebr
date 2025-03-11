
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { UseFormReturn } from 'react-hook-form';
import { LessonFormValues } from './LessonEditor';
import AILessonGenerator from './AILessonGenerator';

interface LessonContentFormProps {
  form: UseFormReturn<LessonFormValues>;
}

const LessonContentForm: React.FC<LessonContentFormProps> = ({ form }) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <AILessonGenerator 
          title={form.watch('title')} 
          setValue={form.setValue}
        />
      </div>
      
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
    </div>
  );
};

export default LessonContentForm;
