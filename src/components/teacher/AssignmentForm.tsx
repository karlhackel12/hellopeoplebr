
import React, { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const assignmentSchema = z.object({
  title: z.string().min(3, { message: 'Title must be at least 3 characters' }),
  description: z.string().optional(),
  student_id: z.string().uuid({ message: 'Please select a student' }),
  content_type: z.enum(['lesson', 'quiz']),
  content_id: z.string().uuid({ message: 'Please select content to assign' }),
  due_date: z.date().optional(),
});

type AssignmentFormValues = z.infer<typeof assignmentSchema>;

interface AssignmentFormProps {
  students: any[];
  lessons: any[];
  quizzes: any[];
  onSuccess: () => void;
}

const AssignmentForm: React.FC<AssignmentFormProps> = ({ 
  students, 
  lessons, 
  quizzes, 
  onSuccess 
}) => {
  const [contentType, setContentType] = useState<'lesson' | 'quiz'>('lesson');

  const form = useForm<AssignmentFormValues>({
    resolver: zodResolver(assignmentSchema),
    defaultValues: {
      title: '',
      description: '',
      content_type: 'lesson',
    },
  });

  // Watch the content type to update the UI
  const watchedContentType = form.watch('content_type');
  
  // Update the state when the form value changes
  React.useEffect(() => {
    if (watchedContentType) {
      setContentType(watchedContentType);
    }
  }, [watchedContentType]);

  const onSubmit = async (values: AssignmentFormValues) => {
    try {
      // Get current user
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        toast.error('Authentication error', {
          description: 'You must be logged in to create assignments',
        });
        return;
      }

      // Prepare assignment data
      const assignmentData = {
        title: values.title,
        description: values.description || null,
        student_id: values.student_id,
        assigned_by: userData.user.id,
        due_date: values.due_date ? values.due_date.toISOString() : null,
        // Set either lesson_id or quiz_id based on content type
        ...(values.content_type === 'lesson' 
          ? { lesson_id: values.content_id, quiz_id: null } 
          : { quiz_id: values.content_id, lesson_id: null })
      };

      // Insert assignment
      const { error } = await supabase
        .from('student_assignments')
        .insert(assignmentData);

      if (error) throw error;

      toast.success('Assignment created', {
        description: 'The assignment has been successfully created',
      });
      
      form.reset();
      onSuccess();
    } catch (error: any) {
      console.error('Error creating assignment:', error);
      toast.error('Failed to create assignment', {
        description: error.message,
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Assignment Title</FormLabel>
                <FormControl>
                  <Input placeholder="Enter assignment title" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="student_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Student</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a student" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {students.length === 0 && (
                      <SelectItem value="no-students" disabled>
                        No students available
                      </SelectItem>
                    )}
                    {students.map((student) => (
                      <SelectItem key={student.id} value={student.id}>
                        {student.first_name} {student.last_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  {students.length === 0 ? 
                    "You need to invite students first" : 
                    "Select the student to assign this content to"
                  }
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (Optional)</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Add description or instructions for the student" 
                  className="min-h-[100px]"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="content_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Content Type</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex flex-col space-y-1"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="lesson" id="lesson" />
                      <label htmlFor="lesson" className="cursor-pointer text-sm font-medium">
                        Lesson
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="quiz" id="quiz" />
                      <label htmlFor="quiz" className="cursor-pointer text-sm font-medium">
                        Quiz
                      </label>
                    </div>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="content_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{contentType === 'lesson' ? 'Lesson' : 'Quiz'}</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={`Select a ${contentType}`} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {contentType === 'lesson' ? (
                      <>
                        {lessons.length === 0 && (
                          <SelectItem value="no-lessons" disabled>
                            No lessons available
                          </SelectItem>
                        )}
                        {lessons.map((lesson) => (
                          <SelectItem key={lesson.id} value={lesson.id}>
                            {lesson.title}
                          </SelectItem>
                        ))}
                      </>
                    ) : (
                      <>
                        {quizzes.length === 0 && (
                          <SelectItem value="no-quizzes" disabled>
                            No quizzes available
                          </SelectItem>
                        )}
                        {quizzes.map((quiz) => (
                          <SelectItem key={quiz.id} value={quiz.id}>
                            {quiz.title}
                          </SelectItem>
                        ))}
                      </>
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="due_date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Due Date (Optional)</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>No due date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value as Date}
                    onSelect={field.onChange}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormDescription>
                Set a deadline for the student to complete this assignment
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button 
          type="submit" 
          className="w-full"
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting ? 'Creating...' : 'Create Assignment'}
        </Button>
      </form>
    </Form>
  );
};

export default AssignmentForm;
