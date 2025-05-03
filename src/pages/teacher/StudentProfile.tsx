import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import TeacherLayout from '@/components/layout/TeacherLayout';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Award, BookOpen, Brain, ClipboardCheck, Clock, Mic, Star, User } from 'lucide-react';
import { format } from 'date-fns';
import { Progress } from '@/components/ui/progress';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { ptBR } from 'date-fns/locale';

const StudentProfile: React.FC = () => {
  const { studentId } = useParams<{ studentId: string }>();
  const navigate = useNavigate();

  const { data: student, isLoading: loadingStudent } = useQuery({
    queryKey: ['student-profile', studentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', studentId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!studentId
  });

  const { data: studentStats, isLoading: loadingStats } = useQuery({
    queryKey: ['student-stats', studentId],
    queryFn: async () => {
      // Lessons progress
      const { data: lessonProgress } = await supabase
        .from('user_lesson_progress')
        .select('*')
        .eq('user_id', studentId);
      
      const completedLessons = lessonProgress?.filter(l => l.completed).length || 0;
      const totalLessons = lessonProgress?.length || 0;
      
      // Quiz attempts
      const { data: quizAttempts } = await supabase
        .from('user_quiz_attempts')
        .select('*')
        .eq('user_id', studentId);
      
      const averageScore = quizAttempts && quizAttempts.length > 0
        ? Math.round(
            quizAttempts.reduce((sum, a) => sum + a.score, 0) / quizAttempts.length
          )
        : 0;
      
      // Voice sessions
      const { data: voiceSessions } = await supabase
        .from('voice_practice_sessions')
        .select('*')
        .eq('user_id', studentId);
      
      // Spaced repetition
      const { data: spacedItems } = await supabase
        .from('spaced_repetition_items')
        .select('*')
        .eq('user_id', studentId);
      
      const { data: spacedStats } = await supabase
        .from('spaced_repetition_stats')
        .select('*')
        .eq('user_id', studentId);
      
      // Assignments
      const { data: assignments } = await supabase
        .from('student_assignments')
        .select('*')
        .eq('student_id', studentId);
      
      return {
        lessons: {
          total: totalLessons,
          completed: completedLessons,
          completionRate: totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0
        },
        quizzes: {
          total: quizAttempts?.length || 0,
          passed: quizAttempts?.filter(q => q.passed).length || 0,
          averageScore
        },
        voicePractice: {
          sessionsCount: voiceSessions?.length || 0,
          totalMinutes: Math.round((voiceSessions?.reduce((sum, s) => sum + (s.duration_seconds || 0), 0) || 0) / 60)
        },
        spacedRepetition: {
          itemsCount: spacedItems?.length || 0,
          reviewsCount: spacedStats?.length || 0
        },
        assignments: {
          total: assignments?.length || 0,
          completed: assignments?.filter(a => a.status === 'completed').length || 0,
          overdue: assignments?.filter(a => 
            a.status !== 'completed' && 
            a.due_date && 
            new Date(a.due_date) < new Date()
          ).length || 0
        }
      };
    },
    enabled: !!studentId
  });

  const { data: recentActivity, isLoading: loadingActivity } = useQuery({
    queryKey: ['student-activity', studentId],
    queryFn: async () => {
      // Get recent assignments
      const { data: assignments } = await supabase
        .from('student_assignments')
        .select('*, lessons(title)')
        .eq('student_id', studentId)
        .order('updated_at', { ascending: false })
        .limit(5);
      
      // Get recent quizzes
      const { data: quizzes } = await supabase
        .from('user_quiz_attempts')
        .select('*, quizzes(title)')
        .eq('user_id', studentId)
        .order('started_at', { ascending: false })
        .limit(5);
      
      // Get recent voice sessions
      const { data: voiceSessions } = await supabase
        .from('voice_practice_sessions')
        .select('*')
        .eq('user_id', studentId)
        .order('started_at', { ascending: false })
        .limit(5);
      
      return {
        assignments: assignments || [],
        quizzes: quizzes || [],
        voiceSessions: voiceSessions || []
      };
    },
    enabled: !!studentId
  });

  const handleGoBack = () => {
    navigate('/teacher/students');
  };

  if (loadingStudent) {
    return (
      <TeacherLayout>
        <div className="p-6 space-y-6">
          <Button variant="ghost" onClick={handleGoBack} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para Alunos
          </Button>
          <div className="flex items-center space-x-4">
            <Skeleton className="h-16 w-16 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
        </div>
      </TeacherLayout>
    );
  }

  return (
    <TeacherLayout pageTitle="Perfil do Aluno">
      <div className="space-y-6">
        <Button variant="ghost" onClick={handleGoBack} className="mb-4 -ml-2">
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para Alunos
        </Button>
        
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          {student?.avatar_url ? (
            <img 
              src={student.avatar_url} 
              alt={`${student.first_name} ${student.last_name}`} 
              className="h-16 w-16 rounded-full object-cover"
            />
          ) : (
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
              <User className="h-8 w-8 text-muted-foreground" />
            </div>
          )}
          
          <div>
            <h1 className="text-2xl font-bold">{student?.first_name} {student?.last_name}</h1>
            <p className="text-muted-foreground">
              Ingressou em {student && format(new Date(student.created_at), 'd MMMM, yyyy', { locale: ptBR })}
            </p>
          </div>
        </div>
        
        {loadingStats ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <BookOpen className="mr-2 h-4 w-4 text-primary" />
                  Progresso das Lições
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold mb-2">{studentStats?.lessons.completionRate}%</div>
                <div className="flex items-center text-sm text-muted-foreground mb-1">
                  <span>{studentStats?.lessons.completed} de {studentStats?.lessons.total} concluídas</span>
                </div>
                <Progress value={studentStats?.lessons.completionRate} className="h-2" />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <Award className="mr-2 h-4 w-4 text-primary" />
                  Desempenho em Questionários
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold mb-2">{studentStats?.quizzes.averageScore}%</div>
                <div className="flex items-center text-sm text-muted-foreground mb-1">
                  <span>{studentStats?.quizzes.passed} de {studentStats?.quizzes.total} questionários aprovados</span>
                </div>
                <Progress value={studentStats?.quizzes.averageScore} className="h-2" />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <ClipboardCheck className="mr-2 h-4 w-4 text-primary" />
                  Tarefas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold mb-2">
                  {studentStats?.assignments.total > 0 
                    ? Math.round((studentStats?.assignments.completed / studentStats?.assignments.total) * 100)
                    : 0}%
                </div>
                <div className="flex items-center text-sm text-muted-foreground mb-1">
                  <span>{studentStats?.assignments.completed} de {studentStats?.assignments.total} concluídas</span>
                  {studentStats?.assignments.overdue > 0 && (
                    <span className="ml-2 text-red-500">{studentStats?.assignments.overdue} atrasadas</span>
                  )}
                </div>
                <Progress 
                  value={studentStats?.assignments.total > 0 
                    ? (studentStats?.assignments.completed / studentStats?.assignments.total) * 100
                    : 0} 
                  className="h-2" 
                />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <Mic className="mr-2 h-4 w-4 text-primary" />
                  Prática de Voz
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{studentStats?.voicePractice.sessionsCount}</div>
                <div className="text-sm text-muted-foreground">
                  Total de sessões com {studentStats?.voicePractice.totalMinutes} minutos
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <Brain className="mr-2 h-4 w-4 text-primary" />
                  Repetição Espaçada
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{studentStats?.spacedRepetition.reviewsCount}</div>
                <div className="text-sm text-muted-foreground">
                  Total de revisões de {studentStats?.spacedRepetition.itemsCount} itens
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <Star className="mr-2 h-4 w-4 text-primary" />
                  Atividade Geral
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {studentStats && (
                    studentStats.lessons.completed + 
                    studentStats.quizzes.total + 
                    studentStats.voicePractice.sessionsCount + 
                    studentStats.spacedRepetition.reviewsCount
                  )}
                </div>
                <div className="text-sm text-muted-foreground">
                  Total de atividades de aprendizagem
                </div>
              </CardContent>
            </Card>
          </div>
        )}
        
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Atividade Recente</h2>
          
          <Tabs defaultValue="assignments">
            <TabsList className="mb-4">
              <TabsTrigger value="assignments" className="flex items-center gap-1.5">
                <ClipboardCheck className="h-4 w-4" /> Tarefas
              </TabsTrigger>
              <TabsTrigger value="quizzes" className="flex items-center gap-1.5">
                <Award className="h-4 w-4" /> Questionários
              </TabsTrigger>
              <TabsTrigger value="voice" className="flex items-center gap-1.5">
                <Mic className="h-4 w-4" /> Prática de Voz
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="assignments">
              {loadingActivity ? (
                <Skeleton className="h-40 w-full" />
              ) : recentActivity?.assignments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhuma atividade de tarefa ainda
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tarefa</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Data de Entrega</TableHead>
                      <TableHead>Concluído</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentActivity?.assignments.map((assignment) => (
                      <TableRow key={assignment.id}>
                        <TableCell className="font-medium">{assignment.title || assignment.lessons?.title}</TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                            ${assignment.status === 'completed' 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                              : assignment.status === 'in_progress'
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                                : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
                            }`}
                          >
                            {assignment.status === 'completed' ? 'Concluído' : 
                             assignment.status === 'in_progress' ? 'Em Progresso' : 'Não Iniciada'}
                          </span>
                        </TableCell>
                        <TableCell>
                          {assignment.due_date ? format(new Date(assignment.due_date), 'd MMMM, yyyy', { locale: ptBR }) : 'Sem data de entrega'}
                        </TableCell>
                        <TableCell>
                          {assignment.completed_at ? format(new Date(assignment.completed_at), 'd MMMM, yyyy', { locale: ptBR }) : '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </TabsContent>
            
            <TabsContent value="quizzes">
              {loadingActivity ? (
                <Skeleton className="h-40 w-full" />
              ) : recentActivity?.quizzes.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhuma atividade de questionário ainda
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Questionário</TableHead>
                      <TableHead>Pontuação</TableHead>
                      <TableHead>Resultado</TableHead>
                      <TableHead>Data</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentActivity?.quizzes.map((quiz) => (
                      <TableRow key={quiz.id}>
                        <TableCell className="font-medium">{quiz.quizzes?.title || 'Questionário sem nome'}</TableCell>
                        <TableCell>{quiz.score}%</TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                            ${quiz.passed
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                              : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                            }`}
                          >
                            {quiz.passed ? 'Aprovado' : 'Reprovado'}
                          </span>
                        </TableCell>
                        <TableCell>
                          {format(new Date(quiz.started_at), 'd MMMM, yyyy', { locale: ptBR })}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </TabsContent>
            
            <TabsContent value="voice">
              {loadingActivity ? (
                <Skeleton className="h-40 w-full" />
              ) : recentActivity?.voiceSessions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhuma atividade de prática de voz ainda
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tópico</TableHead>
                      <TableHead>Duração</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Data</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentActivity?.voiceSessions.map((session) => (
                      <TableRow key={session.id}>
                        <TableCell className="font-medium">{session.topic || 'Prática Geral'}</TableCell>
                        <TableCell>
                          {session.duration_seconds ? `${Math.round(session.duration_seconds / 60)} minutos` : '-'}
                        </TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                            ${session.completed_at
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                              : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                            }`}
                          >
                            {session.completed_at ? 'Concluído' : 'Em Progresso'}
                          </span>
                        </TableCell>
                        <TableCell>
                          {format(new Date(session.started_at), 'd MMMM, yyyy', { locale: ptBR })}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </TeacherLayout>
  );
};

export default StudentProfile;
