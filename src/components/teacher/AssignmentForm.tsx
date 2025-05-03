import React, { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Card } from '@/components/ui/card';

const assignmentSchema = z.object({
  student_id: z.string().uuid({ message: 'Selecione um aluno' }),
  lesson_id: z.string().uuid({ message: 'Selecione uma lição' }),
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<AssignmentFormValues>({
    resolver: zodResolver(assignmentSchema),
    defaultValues: {
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

  const onSubmit = async (values: AssignmentFormValues) => {
    try {
      setIsSubmitting(true);
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        toast.error('Erro de autenticação', {
          description: 'Você precisa estar logado para criar tarefas',
        });
        return;
      }

      // Encontre o título da lição selecionada
      const selectedLesson = lessons.find(lesson => lesson.id === values.lesson_id);
      const lessonTitle = selectedLesson ? selectedLesson.title : 'Lição';

      const assignment = {
        title: `Completar: ${lessonTitle}`,
        student_id: values.student_id,
        assigned_by: userData.user.id,
        due_date: values.due_date ? values.due_date.toISOString() : null,
        lesson_id: values.lesson_id,
        quiz_id: relatedQuizId,
        status: 'not_started'
      };

      const { error } = await supabase
        .from('student_assignments')
        .insert(assignment);

      if (error) {
        console.error('Erro na criação da tarefa:', error);
        throw error;
      }

      toast.success('Tarefa criada', {
        description: `Tarefa atribuída com sucesso${hasRelatedQuiz ? ' com quiz associado' : ''}`,
      });
      
      form.reset();
      onSuccess();
    } catch (error: any) {
      console.error('Erro ao criar tarefa:', error);
      toast.error('Falha ao criar tarefa', {
        description: error.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const publishedLessons = lessons.filter(lesson => lesson.is_published !== false);

  return (
    <Card className="p-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <FormField
              control={form.control}
              name="student_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Aluno</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger disabled={isLoading || isSubmitting}>
                        {isLoading ? (
                          <div className="flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>Carregando alunos...</span>
                          </div>
                        ) : (
                          <SelectValue placeholder="Selecione um aluno" />
                        )}
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {students.length === 0 && (
                        <SelectItem value="no-students" disabled>
                          Nenhum aluno disponível
                        </SelectItem>
                      )}
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
              name="lesson_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lição</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger disabled={isLoading || isSubmitting}>
                        {isLoading ? (
                          <div className="flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>Carregando lições...</span>
                          </div>
                        ) : (
                          <SelectValue placeholder="Selecione uma lição" />
                        )}
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {publishedLessons.length === 0 && (
                        <SelectItem value="no-lessons" disabled>
                          Nenhuma lição publicada disponível
                        </SelectItem>
                      )}
                      {publishedLessons.map((lesson) => (
                        <SelectItem key={lesson.id} value={lesson.id}>
                          {lesson.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {hasRelatedQuiz && (
                    <p className="text-xs mt-1 text-blue-600">
                      Esta lição tem um quiz associado que será atribuído automaticamente
                    </p>
                  )}
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
                <FormLabel>Data de Entrega (Opcional)</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                        disabled={isSubmitting}
                      >
                        {field.value ? (
                          format(field.value, "dd/MM/yyyy")
                        ) : (
                          <span>Selecione uma data</span>
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

          <div className="pt-2 flex justify-end">
            <Button 
              type="submit" 
              disabled={isSubmitting || isLoading}
              className="w-full md:w-auto"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Atribuindo tarefa...
                </span>
              ) : (
                'Atribuir Tarefa'
              )}
            </Button>
          </div>
        </form>
      </Form>
    </Card>
  );
};

export default AssignmentForm;
