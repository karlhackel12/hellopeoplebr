
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UseFormReturn } from 'react-hook-form';
import { z } from 'zod';

// Define form validation schema
export const createLessonSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters." }),
  level: z.enum(['beginner', 'intermediate', 'advanced'], { 
    required_error: "Please select a level" 
  }),
  instructions: z.string().optional(),
});

export type CreateLessonFormValues = z.infer<typeof createLessonSchema>;

interface LessonFormFieldsProps {
  form: UseFormReturn<CreateLessonFormValues>;
  generating: boolean;
  isLoading: boolean;
}

const LessonFormFields: React.FC<LessonFormFieldsProps> = ({ 
  form, 
  generating, 
  isLoading 
}) => {
  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormLabel>English Lesson Title</FormLabel>
            <FormControl>
              <Input 
                placeholder="e.g., Present Continuous Tense" 
                {...field} 
                disabled={generating || isLoading}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="level"
        render={({ field }) => (
          <FormItem>
            <FormLabel>English Proficiency Level</FormLabel>
            <Select 
              onValueChange={field.onChange} 
              defaultValue={field.value}
              disabled={generating || isLoading}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select a level" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="instructions"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Teaching Instructions (Optional)</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Add specific instructions for the English lesson, e.g., 'Focus on business vocabulary' or 'Include pronunciation tips'"
                className="min-h-[120px] resize-y"
                {...field}
                disabled={generating || isLoading}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default LessonFormFields;
