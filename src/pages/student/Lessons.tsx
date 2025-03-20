
import React from 'react';
import StudentLayout from '@/components/layout/StudentLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, BookOpen, Clock, Star, Trophy, Activity, Zap, ArrowRight, Calendar, List, Info } from 'lucide-react';
import { format, isPast, isToday, isTomorrow, addDays } from 'date-fns';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import AssignmentCard from '@/components/student/AssignmentCard';
import GardenProgress from '@/components/ui/garden-progress';

const StudentLessons: React.FC = () => {
  // Fetch student assignments (lessons and quizzes)
  const {
    data: assignments,
    isLoading: loadingAssignments
  } = useQuery({
    queryKey: ['student-lesson-assignments'],
    queryFn: async () => {
      const {
        data: {
          user
        }
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');
      const {
        data,
        error
      } = await supabase.from('student_assignments').select(`
          id,
          title,
          description,
          due_date,
          status,
          created_at,
          lesson_id,
          quiz_id,
          lessons:lesson_id (
            id, 
            title, 
            content,
            estimated_minutes
          ),
          quizzes:quiz_id (
            id, 
            title
          )
        `).eq('student_id', user.id).order('created_at', {
        ascending: false
      });
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch lesson progress
  const {
    data: progressData,
    isLoading: loadingProgress
  } = useQuery({
    queryKey: ['student-all-lesson-progress'],
    queryFn: async () => {
      const {
        data: {
          user
        }
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');
      const {
        data,
        error
      } = await supabase.from('user_lesson_progress').select('lesson_id, completed, last_accessed_at').eq('user_id', user.id);
      if (error) throw error;

      // Convert to a map for easy lookup
      const progressMap = new Map();
      data?.forEach(item => {
        progressMap.set(item.lesson_id, item);
      });
      return progressMap;
    }
  });
  const isLoading = loadingAssignments || loadingProgress;

  // Filter assignments by type and status
  const pendingAssignments = assignments?.filter(a => a.status === 'not_started') || [];
  const inProgressAssignments = assignments?.filter(a => a.status === 'in_progress') || [];
  const completedAssignments = assignments?.filter(a => a.status === 'completed') || [];
  const dueSoonAssignments = assignments?.filter(a => a.due_date && (isToday(new Date(a.due_date)) || isTomorrow(new Date(a.due_date))) && a.status !== 'completed') || [];

  // Calculate learning stats
  const totalAssignments = assignments?.length || 0;
  const completedCount = completedAssignments?.length || 0;
  const inProgressCount = inProgressAssignments?.length || 0;
  const completionRate = totalAssignments > 0 ? Math.round(completedCount / totalAssignments * 100) : 0;
  const averageCompletionTimeInDays = 7; // This would be calculated from actual data

  function getLessonProgress(lessonId: string) {
    if (!progressData) return null;
    return progressData.get(lessonId);
  }
  return <StudentLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Minhas Lições</h1>
            
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Learning Dashboard Card */}
          <Card className="relative overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-primary via-primary/90 to-primary/80 text-white">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl mb-1 flex items-center gap-2">
                    <BookOpen className="h-5 w-5" /> Painel de Aprendizado
                  </CardTitle>
                  <CardDescription className="text-slate-100 opacity-90">
                    Acompanhe sua jornada de aprendizado
                  </CardDescription>
                </div>
                <div className="bg-white/20 px-3 py-1.5 rounded-full flex items-center gap-1.5">
                  <Star className="h-4 w-4 text-yellow-300 fill-yellow-300" />
                  <span className="font-bold">{completedCount}</span>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="pt-4">
              {isLoading ? <div className="py-8 flex flex-col gap-4">
                  <Skeleton className="h-8 w-32" />
                  <Skeleton className="h-4 w-48" />
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-20 w-full" />
                  </div>
                </div> : <>
                  <div className="mb-5">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-muted-foreground">Taxa de conclusão</span>
                      <span className="text-sm font-medium">{completionRate}%</span>
                    </div>
                    <Progress value={completionRate} className="h-2" indicatorClassName={completionRate > 75 ? "bg-green-500" : completionRate > 25 ? "bg-yellow-500" : "bg-red-500"} />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="border rounded-lg p-3 flex flex-col items-center justify-center">
                      <Trophy className="h-5 w-5 text-amber-500 mb-1" />
                      <div className="text-lg font-bold">{completedCount}</div>
                      <div className="text-xs text-muted-foreground">Concluídas</div>
                    </div>
                    
                    <div className="border rounded-lg p-3 flex flex-col items-center justify-center">
                      <Activity className="h-5 w-5 text-blue-500 mb-1" />
                      <div className="text-lg font-bold">{inProgressCount}</div>
                      <div className="text-xs text-muted-foreground">Em Progresso</div>
                    </div>
                    
                    <div className="border rounded-lg p-3 flex flex-col items-center justify-center">
                      <Clock className="h-5 w-5 text-indigo-500 mb-1" />
                      <div className="text-lg font-bold">{averageCompletionTimeInDays}</div>
                      <div className="text-xs text-muted-foreground">Média de Dias</div>
                    </div>
                    
                    <div className="border rounded-lg p-3 flex flex-col items-center justify-center">
                      <GardenProgress value={completionRate} className="flex items-center justify-center" />
                      <div className="text-xs text-muted-foreground mt-1">Crescimento</div>
                    </div>
                  </div>
                </>}
            </CardContent>
            
            <CardFooter className="border-t bg-slate-50 px-6">
              <Button className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70" disabled={isLoading || dueSoonAssignments.length === 0} onClick={() => document.getElementById('due-soon-tab')?.click()}>
                {dueSoonAssignments.length > 0 ? `Iniciar Lições com Prazo Próximo (${dueSoonAssignments.length})` : "Nenhuma Lição com Prazo Próximo"}
              </Button>
            </CardFooter>
          </Card>
          
          {/* Learning Tips Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Info className="h-5 w-5" /> Dicas de Aprendizado
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-sm">
                <p>
                  <strong>Aprendizado efetivo</strong> requer prática regular e engajamento ativo 
                  com o material. Aqui estão algumas dicas para maximizar seu aprendizado:
                </p>
                <div className="flex items-start gap-2">
                  <Clock className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                  <p>
                    <strong>Agende sessões regulares de estudo</strong> - Sessões curtas e consistentes são mais
                    eficazes do que estudar muito de uma vez.
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <Trophy className="h-5 w-5 text-amber-500 mt-1 flex-shrink-0" />
                  <p>
                    <strong>Teste-se frequentemente</strong> - Use os quizzes e adicione perguntas
                    ao seu sistema de repetição espaçada para melhorar a memória de longo prazo.
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <Zap className="h-5 w-5 text-yellow-500 mt-1 flex-shrink-0" />
                  <p>
                    <strong>Aplique o que aprende</strong> - Tente usar novos conceitos em cenários
                    do mundo real para solidificar sua compreensão.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="all">
          <TabsList className="w-full sm:w-auto flex flex-wrap">
            <TabsTrigger value="all" className="flex items-center gap-1.5">
              <List className="h-4 w-4" /> Todas as Lições
            </TabsTrigger>
            <TabsTrigger value="in-progress" className="flex items-center gap-1.5">
              <Activity className="h-4 w-4" /> Em Progresso
            </TabsTrigger>
            <TabsTrigger id="due-soon-tab" value="due-soon" className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" /> Prazo Próximo
            </TabsTrigger>
            <TabsTrigger value="completed" className="flex items-center gap-1.5">
              <Trophy className="h-4 w-4" /> Concluídas
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="mt-6">
            <RenderAssignments assignments={assignments} isLoading={isLoading} getProgress={getLessonProgress} />
          </TabsContent>
          
          <TabsContent value="in-progress" className="mt-6">
            <RenderAssignments assignments={inProgressAssignments} isLoading={isLoading} emptyMessage="Nenhuma lição em progresso" getProgress={getLessonProgress} />
          </TabsContent>
          
          <TabsContent value="due-soon" className="mt-6">
            <RenderAssignments assignments={dueSoonAssignments} isLoading={isLoading} emptyMessage="Nenhuma lição com prazo próximo" getProgress={getLessonProgress} />
          </TabsContent>
          
          <TabsContent value="completed" className="mt-6">
            <RenderAssignments assignments={completedAssignments} isLoading={isLoading} emptyMessage="Nenhuma lição concluída" getProgress={getLessonProgress} />
          </TabsContent>
        </Tabs>
      </div>
    </StudentLayout>;
};

interface RenderAssignmentsProps {
  assignments?: any[];
  isLoading: boolean;
  emptyMessage?: string;
  getProgress: (lessonId: string) => any;
}

const RenderAssignments: React.FC<RenderAssignmentsProps> = ({
  assignments,
  isLoading,
  emptyMessage = "Nenhuma tarefa encontrada",
  getProgress
}) => {
  if (isLoading) {
    return <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map(i => <Card key={i} className="overflow-hidden">
            <CardHeader className="pb-2">
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full mb-4" />
              <div className="flex gap-2 mb-4">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>)}
      </div>;
  }
  if (!assignments || assignments.length === 0) {
    return <div className="text-center py-12 bg-muted/20 rounded-lg border border-dashed">
        <BookOpen className="h-12 w-12 text-muted-foreground/60 mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-1">{emptyMessage}</h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          Você não tem nenhuma tarefa nesta categoria ainda. 
          À medida que avançar em seu aprendizado, elas aparecerão aqui.
        </p>
      </div>;
  }
  return <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {assignments.map(assignment => <AssignmentCard key={assignment.id} assignment={assignment} progress={assignment.lesson_id ? getProgress(assignment.lesson_id) : null} />)}
    </div>;
};

export default StudentLessons;
