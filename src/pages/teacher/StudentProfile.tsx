import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import TeacherLayout from '@/components/layout/TeacherLayout';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Award, BookOpen, Brain, ClipboardCheck, Clock, Mic, Star, User, RefreshCw } from 'lucide-react';
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
import { toast } from 'sonner';

const StudentProfile: React.FC = () => {
  const { studentId } = useParams<{ studentId: string }>();
  const navigate = useNavigate();
  const isVirtual = new URLSearchParams(window.location.search).get('virtual') === 'true';

  // Student profile data
  const { 
    data: student, 
    isLoading: loadingStudent,
    refetch: refetchStudent
  } = useQuery({
    queryKey: ['student-profile', studentId, isVirtual],
    queryFn: async () => {
      try {
        // For virtual students, we need to get data from student_invitations
        if (isVirtual && studentId) {
          const { data: invitationData, error: invitationError } = await supabase
            .from('student_invitations')
            .select('*')
            .eq('id', studentId)
            .single();
            
          if (invitationError) throw invitationError;
          
          // Create a virtual profile from invitation data
          return {
            id: invitationData.id,
            first_name: invitationData.used_by_name ? invitationData.used_by_name.split(' ')[0] : 'Aluno',
            last_name: invitationData.used_by_name && invitationData.used_by_name.split(' ').length > 1 
              ? invitationData.used_by_name.split(' ').slice(1).join(' ') 
              : 'Convidado',
            email: invitationData.email,
            created_at: invitationData.accepted_at || invitationData.created_at,
            avatar_url: null,
            is_virtual: true
          };
        }
        
        // For real students, get from profiles
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', studentId)
          .single();
          
        if (error) throw error;
        
        // We also need to get their email from invitations
        const { data: invitationData } = await supabase
          .from('student_invitations')
          .select('email')
          .eq('user_id', studentId)
          .single();
          
        return {
          ...data,
          email: invitationData?.email,
          is_virtual: false
        };
      } catch (error) {
        console.error('Error fetching student profile:', error);
        toast.error('Failed to load student profile');
        return null;
      }
    },
    enabled: !!studentId
  });

  // Student stats
  const { 
    data: studentStats, 
    isLoading: loadingStats,
    refetch: refetchStats
  } = useQuery({
    queryKey: ['student-stats', studentId],
    queryFn: async () => {
      try {
        // For virtual students, we return zeroed stats
        if (isVirtual) {
          return {
            lessons: {
              total: 0,
              completed: 0,
              completionRate: 0
            },
            quizzes: {
              total: 0,
              passed: 0,
              averageScore: 0
            },
            voicePractice: {
              sessionsCount: 0,
              totalMinutes: 0
            },
            spacedRepetition: {
              itemsCount: 0,
              reviewsCount: 0
            },
            assignments: {
              total: 0,
              completed: 0,
              overdue: 0
            }
          };
        }
        
        // Lessons progress
        const { data: lessonProgress, error: lessonError } = await supabase
          .from('user_lesson_progress')
          .select('*')
          .eq('user_id', studentId);
          
        if (lessonError) throw lessonError;
        
        const completedLessons = lessonProgress?.filter(l => l.completed).length || 0;
        const totalLessons = lessonProgress?.length || 0;
        
        // Quiz attempts
        const { data: quizAttempts, error: quizError } = await supabase
          .from('user_quiz_attempts')
          .select('*')
          .eq('user_id', studentId);
          
        if (quizError) throw quizError;
        
        const averageScore = quizAttempts && quizAttempts.length > 0
          ? Math.round(
              quizAttempts.reduce((sum, a) => sum + a.score, 0) / quizAttempts.length
            )
          : 0;
        
        // Voice sessions
        const { data: voiceSessions, error: voiceError } = await supabase
          .from('voice_practice_sessions')
          .select('*')
          .eq('user_id', studentId);
          
        if (voiceError) throw voiceError;
        
        // Spaced repetition
        const { data: spacedItems, error: spacedItemsError } = await supabase
          .from('spaced_repetition_items')
          .select('*')
          .eq('user_id', studentId);
          
        if (spacedItemsError) throw spacedItemsError;
        
        const { data: spacedStats, error: spacedStatsError } = await supabase
          .from('spaced_repetition_stats')
          .select('*')
          .eq('user_id', studentId);
          
        if (spacedStatsError) throw spacedStatsError;
        
        // Assignments
        const { data: assignments, error: assignmentsError } = await supabase
          .from('student_assignments')
          .select('*')
          .eq('student_id', studentId);
          
        if (assignmentsError) throw assignmentsError;
        
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
      } catch (error) {
        console.error('Error fetching student stats:', error);
        toast.error('Failed to load student statistics');
        return null;
      }
    },
    enabled: !!studentId
  });

  // Student recent activity
  const { 
    data: recentActivity, 
    isLoading: loadingActivity,
    refetch: refetchActivity
  } = useQuery({
    queryKey: ['student-activity', studentId],
    queryFn: async () => {
      try {
        // For virtual students, return empty activity
        if (isVirtual) {
          return {
            assignments: [],
            quizzes: [],
            voiceSessions: []
          };
        }
        
        // Get recent assignments
        const { data: assignments, error: assignmentsError } = await supabase
          .from('student_assignments')
          .select('*, lessons(title)')
          .eq('student_id', studentId)
          .order('updated_at', { ascending: false })
          .limit(5);
          
        if (assignmentsError) throw assignmentsError;
        
        // Get recent quizzes
        const { data: quizzes, error: quizzesError } = await supabase
          .from('user_quiz_attempts')
          .select('*, quizzes(title)')
          .eq('user_id', studentId)
          .order('started_at', { ascending: false })
          .limit(5);
          
        if (quizzesError) throw quizzesError;
        
        // Get recent voice sessions
        const { data: voiceSessions, error: voiceError } = await supabase
          .from('voice_practice_sessions')
          .select('*')
          .eq('user_id', studentId)
          .order('started_at', { ascending: false })
          .limit(5);
          
        if (voiceError) throw voiceError;
        
        return {
          assignments: assignments || [],
          quizzes: quizzes || [],
          voiceSessions: voiceSessions || []
        };
      } catch (error) {
        console.error('Error fetching student activity:', error);
        toast.error('Failed to load recent activity');
        return {
          assignments: [],
          quizzes: [],
          voiceSessions: []
        };
      }
    },
    enabled: !!studentId
  });

  const handleGoBack = () => {
    navigate('/teacher/students');
  };
  
  const handleRefreshData = () => {
    toast.info('Atualizando dados do aluno...');
    refetchStudent();
    refetchStats();
    refetchActivity();
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

  if (!student) {
    return (
      <TeacherLayout pageTitle="Perfil do Aluno">
        <div className="space-y-6">
          <Button variant="ghost" onClick={handleGoBack} className="mb-4 -ml-2">
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para Alunos
          </Button>
          
          <Card>
            <CardContent className="flex flex-col items-center justify-center p-8">
              <User className="h-16 w-16 text-muted-foreground mb-4" />
              <h2 className="text-xl font-bold mb-2">Aluno não encontrado</h2>
              <p className="text-muted-foreground mb-4">Não foi possível encontrar os dados deste aluno</p>
              <Button onClick={handleGoBack}>Voltar para Lista de Alunos</Button>
            </CardContent>
          </Card>
        </div>
      </TeacherLayout>
    );
  }

  return (
    <TeacherLayout pageTitle="Perfil do Aluno">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Button variant="ghost" onClick={handleGoBack} className="-ml-2">
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para Alunos
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefreshData}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Atualizar dados
          </Button>
        </div>
        
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
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
              {student.email && (
                <p className="text-muted-foreground">{student.email}</p>
              )}
              <p className="text-muted-foreground">
                Ingressou em {student && format(new Date(student.created_at), 'd MMMM, yyyy', { locale: ptBR })}
              </p>
            </div>
          </div>
        </div>
        
        {loadingStats ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        ) : !studentStats ? (
          <Card>
            <CardContent className="p-6">
              <p className="text-center text-muted-foreground">Não foi possível carregar as estatísticas do aluno</p>
            </CardContent>
          </Card>
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
              ) : !recentActivity || recentActivity.assignments.length === 0 ? (
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
              ) : !recentActivity || recentActivity.quizzes.length === 0 ? (
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
              ) : !recentActivity || recentActivity.voiceSessions.length === 0 ? (
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
