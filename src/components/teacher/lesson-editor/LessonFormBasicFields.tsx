
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { LessonFormValues } from './useLessonForm';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';

interface LessonFormBasicFieldsProps {
  form: UseFormReturn<LessonFormValues>;
}

const LessonFormBasicFields: React.FC<LessonFormBasicFieldsProps> = ({ form }) => {
  return (
    <>
      <FormField
        control={form.control}
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Lesson Title</FormLabel>
            <FormControl>
              <Input placeholder="Enter lesson title" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="is_published"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
            <FormControl>
              <Switch
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
            <div className="space-y-1">
              <FormLabel>Publish Lesson</FormLabel>
              <p className="text-sm text-muted-foreground">
                Make this lesson visible to students
              </p>
            </div>
          </FormItem>
        )}
      />
    </>
  );
};

export default LessonFormBasicFields;
