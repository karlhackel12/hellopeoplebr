import React, { useState, useEffect } from 'react';
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
import { CalendarIcon, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const assignmentSchema = z.object({
  title: z.string().min(3, { message: 'Title must be at least 3 characters' }),
  description: z.string().optional(),
  student_id: z.string().uuid({ message: 'Please select a student' }),
  lesson_id: z.string().uuid({ message: 'Please select a lesson to assign' }),
  due_date: z.date().optional(),
});

type AssignmentFormValues = z.infer<typeof assignmentSchema>;

interface Lesson {
  id: string;
  title: string;
  is_published?: boolean;
}

interface Quiz {
  id: string;
  title: string;
  lesson_id?: string;
  is_published?: boolean;
}

interface AssignmentFormProps {
  students: any[];
  lessons: Lesson[];
  quizzes: Quiz[];
  onSuccess: () => void;
  initialStudentId?: string;
  isLoading?: boolean;
}

const AssignmentForm: React.FC<AssignmentFormProps> = ({ 
  students, 
  lessons, 
  quizzes, 
  onSuccess,
  initialStudentId,
  isLoading = false
}) => {
  const [selectedLesson, setSelectedLesson] = useState<string | null>(null);
  const [hasRelatedQuiz, setHasRelatedQuiz] = useState<boolean>(false);
  const [relatedQuizId, setRelatedQuizId] = useState<string | null>(null);
  
  const form = useForm<AssignmentFormValues>({
    resolver: zodResolver(assignmentSchema),
    defaultValues: {
      title: '',
      description: '',
      student_id: initialStudentId || '',
    },
  });

  useEffect(() => {
    if (initialStudentId) {
      form.setValue('student_id', initialStudentId, {
        shouldValidate: true,
        shouldDirty: true
      });
    }
  }, [initialStudentId, form]);

  useEffect(() => {
    const lessonId = form.watch('lesson_id');
    if (lessonId) {
      const relatedQuiz = quizzes.find(quiz => quiz.lesson_id === lessonId);
      setHasRelatedQuiz(!!relatedQuiz);
      setRelatedQuizId(relatedQuiz?.id || null);
      setSelectedLesson(lessonId);
    } else {
      setHasRelatedQuiz(false);
      setRelatedQuizId(null);
      setSelectedLesson(null);
    }
  }, [form.watch('lesson_id'), quizzes]);

  useEffect(() => {
    const lessonId = form.watch('lesson_id');
    if (lessonId && !form.getValues('title')) {
      const selectedLesson = lessons.find(lesson => lesson.id === lessonId);
      if (selectedLesson) {
        form.setValue('title', `Complete: ${selectedLesson.title}`, { 
          shouldValidate: true,
          shouldDirty: true
        });
      }
    }
  }, [form.watch('lesson_id'), lessons, form]);

  const onSubmit = async (values: AssignmentFormValues) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        toast.error('Authentication error', {
          description: 'You must be logged in to create assignments',
        });
        return;
      }

      const assignment = {
        title: values.title,
        description: values.description || null,
        student_id: values.student_id,
        assigned_by: userData.user.id,
        due_date: values.due_date ? values.due_date.toISOString() : null,
        lesson_id: values.lesson_id,
        quiz_id: relatedQuizId,
        status: 'not_started'
      };

      console.log('Creating assignment with data:', assignment);

      const { error } = await supabase
        .from('student_assignments')
        .insert(assignment);

      if (error) {
        console.error('Assignment creation error:', error);
        throw error;
      }

      toast.success('Assignment created', {
        description: `Assignment has been successfully created${hasRelatedQuiz ? ' with associated quiz' : ''}`,
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

  const publishedLessons = lessons.filter(lesson => lesson.is_published !== false);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="student_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Student</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger disabled={isLoading}>
                      {isLoading ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Loading students...</span>
                        </div>
                      ) : (
                        <SelectValue placeholder="Select a student" />
                      )}
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
          
          <FormField
            control={form.control}
            name="lesson_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Lesson</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger disabled={isLoading}>
                      {isLoading ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Loading lessons...</span>
                        </div>
                      ) : (
                        <SelectValue placeholder="Select a lesson" />
                      )}
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {publishedLessons.length === 0 && (
                      <SelectItem value="no-lessons" disabled>
                        No published lessons available
                      </SelectItem>
                    )}
                    {publishedLessons.map((lesson) => (
                      <SelectItem key={lesson.id} value={lesson.id}>
                        {lesson.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  {publishedLessons.length === 0 ? 
                    "You need to create and publish lessons first" : 
                    "Select the lesson to assign"
                  }
                </FormDescription>
                {hasRelatedQuiz && (
                  <p className="text-sm mt-2 text-blue-600">
                    This lesson has an associated quiz that will be assigned automatically
                  </p>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
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
          disabled={form.formState.isSubmitting || isLoading}
        >
          {form.formState.isSubmitting ? 
            'Creating...' : 
            hasRelatedQuiz ? 
              'Create Assignment with Quiz' : 
              'Create Assignment'
          }
        </Button>
      </form>
    </Form>
  );
};

export default AssignmentForm;
