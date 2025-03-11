
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { UseFormReturn } from 'react-hook-form';
import { LessonFormValues } from './LessonEditor';

interface LessonContentFormProps {
  form: UseFormReturn<LessonFormValues>;
}

const LessonContentForm: React.FC<LessonContentFormProps> = ({ form }) => {
  return (
    <FormField
      control={form.control}
      name="content"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Lesson Content</FormLabel>
          <FormControl>
            <Textarea 
              placeholder="Enter lesson content here..." 
              className="min-h-[300px]"
              {...field} 
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default LessonContentForm;
