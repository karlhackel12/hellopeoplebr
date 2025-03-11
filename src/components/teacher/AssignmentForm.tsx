
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
import { CalendarIcon, Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Checkbox } from '@/components/ui/checkbox';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';

const assignmentSchema = z.object({
  title: z.string().min(3, { message: 'Title must be at least 3 characters' }),
  description: z.string().optional(),
  student_id: z.string().uuid({ message: 'Please select a student' }),
  content_type: z.enum(['lesson', 'quiz']),
  content_ids: z.array(z.string().uuid()).min(1, { message: 'Please select at least one item to assign' }),
  due_date: z.date().optional(),
});

type AssignmentFormValues = z.infer<typeof assignmentSchema>;

interface AssignmentFormProps {
  students: any[];
  lessons: any[];
  quizzes: any[];
  onSuccess: () => void;
  initialStudentId?: string; // Added initialStudentId prop as optional
}

const AssignmentForm: React.FC<AssignmentFormProps> = ({ 
  students, 
  lessons, 
  quizzes, 
  onSuccess,
  initialStudentId
}) => {
  const [contentType, setContentType] = useState<'lesson' | 'quiz'>('lesson');
  const [open, setOpen] = useState(false);

  const form = useForm<AssignmentFormValues>({
    resolver: zodResolver(assignmentSchema),
    defaultValues: {
      title: '',
      description: '',
      content_type: 'lesson',
      content_ids: [],
      student_id: initialStudentId || '', // Use initialStudentId if provided
    },
  });

  // Watch the content type to update the UI
  const watchedContentType = form.watch('content_type');
  
  // Update the state when the form value changes
  React.useEffect(() => {
    if (watchedContentType) {
      setContentType(watchedContentType);
      // Reset content selections when changing type
      form.setValue('content_ids', []);
    }
  }, [watchedContentType, form]);

  // Set initialStudentId when it changes
  React.useEffect(() => {
    if (initialStudentId) {
      form.setValue('student_id', initialStudentId, {
        shouldValidate: true,
        shouldDirty: true
      });
    }
  }, [initialStudentId, form]);

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

      // Create multiple assignments (one per selected content)
      const assignments = values.content_ids.map(contentId => ({
        title: values.title,
        description: values.description || null,
        student_id: values.student_id,
        assigned_by: userData.user.id,
        due_date: values.due_date ? values.due_date.toISOString() : null,
        // Set either lesson_id or quiz_id based on content type
        ...(values.content_type === 'lesson' 
          ? { lesson_id: contentId, quiz_id: null } 
          : { quiz_id: contentId, lesson_id: null })
      }));

      // Insert assignments
      const { error } = await supabase
        .from('student_assignments')
        .insert(assignments);

      if (error) throw error;

      toast.success('Assignments created', {
        description: `${assignments.length} assignment(s) have been successfully created`,
      });
      
      form.reset();
      onSuccess();
    } catch (error: any) {
      console.error('Error creating assignments:', error);
      toast.error('Failed to create assignments', {
        description: error.message,
      });
    }
  };

  const availableContent = contentType === 'lesson' ? lessons : quizzes;

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
          name="content_ids"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{contentType === 'lesson' ? 'Lessons' : 'Quizzes'} (multiple selection)</FormLabel>
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={open}
                      className="w-full justify-between"
                    >
                      {field.value.length > 0
                        ? `${field.value.length} item(s) selected`
                        : `Select ${contentType === 'lesson' ? 'lessons' : 'quizzes'}`}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput placeholder={`Search ${contentType === 'lesson' ? 'lessons' : 'quizzes'}...`} />
                    <CommandEmpty>No {contentType} found.</CommandEmpty>
                    <CommandGroup className="max-h-64 overflow-auto">
                      {availableContent.length === 0 ? (
                        <CommandItem disabled>
                          No {contentType === 'lesson' ? 'lessons' : 'quizzes'} available
                        </CommandItem>
                      ) : (
                        availableContent.map((item) => (
                          <CommandItem
                            key={item.id}
                            onSelect={() => {
                              const selected = field.value.includes(item.id)
                                ? field.value.filter(id => id !== item.id)
                                : [...field.value, item.id];
                              form.setValue('content_ids', selected, { 
                                shouldValidate: true,
                                shouldDirty: true
                              });
                            }}
                          >
                            <div className="flex items-center gap-2">
                              <Checkbox 
                                checked={field.value.includes(item.id)}
                                onCheckedChange={(checked) => {
                                  const selected = checked
                                    ? [...field.value, item.id]
                                    : field.value.filter(id => id !== item.id);
                                  form.setValue('content_ids', selected, { 
                                    shouldValidate: true,
                                    shouldDirty: true
                                  });
                                }}
                              />
                              <span>{item.title}</span>
                            </div>
                            <Check
                              className={cn(
                                "ml-auto h-4 w-4",
                                field.value.includes(item.id) ? "opacity-100" : "opacity-0"
                              )}
                            />
                          </CommandItem>
                        ))
                      )}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
              {availableContent.length === 0 && (
                <FormDescription>
                  You need to create {contentType === 'lesson' ? 'lessons' : 'quizzes'} first
                </FormDescription>
              )}
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
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting ? 'Creating...' : 'Create Assignment'}
        </Button>
      </form>
    </Form>
  );
};

export default AssignmentForm;
