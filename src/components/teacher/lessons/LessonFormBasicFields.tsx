
import React from 'react';
import { 
  FormField, 
  FormItem, 
  FormLabel, 
  FormControl, 
  FormDescription, 
  FormMessage 
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { UseFormReturn } from 'react-hook-form';
import { LessonFormValues } from './useLessonForm';

interface LessonFormBasicFieldsProps {
  form: UseFormReturn<LessonFormValues>;
}

const LessonFormBasicFields: React.FC<LessonFormBasicFieldsProps> = ({ form }) => {
  return (
    <div className="grid gap-6">
      <FormField
        control={form.control}
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Lesson Title</FormLabel>
            <FormControl>
              <Input 
                placeholder="Enter a descriptive title for your lesson" 
                {...field} 
              />
            </FormControl>
            <FormDescription>
              Choose a clear title that describes the content of your lesson.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="is_published"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <FormLabel className="text-base">
                Publish Lesson
              </FormLabel>
              <FormDescription>
                When published, this lesson will be visible to your students.
              </FormDescription>
            </div>
            <FormControl>
              <Switch
                checked={Boolean(field.value)}
                onCheckedChange={field.onChange}
              />
            </FormControl>
          </FormItem>
        )}
      />
    </div>
  );
};

export default LessonFormBasicFields;
