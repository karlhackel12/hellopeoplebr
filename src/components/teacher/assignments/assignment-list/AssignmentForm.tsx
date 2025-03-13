
import React, { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

// Define the form schema
const formSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().optional(),
  studentId: z.string().uuid('Invalid student ID'),
  contentType: z.enum(['quiz']),
  contentId: z.string().uuid('Invalid content ID'),
  dueDate: z.date().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface AssignmentFormProps {
  students: any[];
  quizzes: any[];
  onSuccess: () => void;
  initialStudentId?: string;
  isLoading: boolean;
}

const AssignmentForm: React.FC<AssignmentFormProps> = ({
  students,
  quizzes,
  onSuccess,
  initialStudentId,
  isLoading,
}) => {
  const [saving, setSaving] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      studentId: initialStudentId || '',
      contentType: 'quiz',
      contentId: '',
      dueDate: undefined,
    },
  });

  // Get values from form
  const contentType = form.watch('contentType');

  const onSubmit = async (values: FormValues) => {
    try {
      setSaving(true);
      
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        toast.error('Authentication error', {
          description: 'You must be logged in to create assignments',
        });
        return;
      }

      // Prepare the assignment data based on selected content type
      const assignmentData = {
        title: values.title,
        description: values.description || null,
        student_id: values.studentId,
        assigned_by: user.user.id,
        due_date: values.dueDate ? values.dueDate.toISOString() : null,
        quiz_id: values.contentType === 'quiz' ? values.contentId : null,
        status: 'not_started',
      };

      // Insert the assignment
      const { error: insertError } = await supabase
        .from('student_assignments')
        .insert(assignmentData);

      if (insertError) throw insertError;

      toast.success('Assignment created', {
        description: 'The assignment has been successfully created',
      });

      // Reset form
      form.reset({
        title: '',
        description: '',
        studentId: initialStudentId || '',
        contentType: 'quiz',
        contentId: '',
        dueDate: undefined,
      });

      // Call success callback
      onSuccess();
    } catch (error: any) {
      console.error('Error creating assignment:', error);
      toast.error('Failed to create assignment', {
        description: error.message,
      });
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-6">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Assignment Title</FormLabel>
              <FormControl>
                <Input placeholder="Enter a title for this assignment" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter any additional instructions or details"
                  {...field}
                  value={field.value || ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="studentId"
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
                    {students.map((student) => (
                      <SelectItem key={student.id} value={student.id}>
                        {student.first_name} {student.last_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="contentType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Content Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select content type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="quiz">Quiz</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="contentId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {contentType === 'quiz' ? 'Quiz' : 'Content'}
              </FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={`Select a ${contentType}`} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {contentType === 'quiz' &&
                    quizzes.map((quiz) => (
                      <SelectItem key={quiz.id} value={quiz.id}>
                        {quiz.title}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="dueDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Due Date (Optional)</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      className={cn(
                        'pl-3 text-left font-normal',
                        !field.value && 'text-muted-foreground'
                      )}
                    >
                      {field.value ? (
                        format(field.value, 'PPP')
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end">
          <Button type="submit" disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              'Create Assignment'
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default AssignmentForm;
