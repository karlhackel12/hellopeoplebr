import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Clock, Award, TrendingUp, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface StudentPerformance {
  id: string;
  name: string;
  quizAvg: number;
  quizCount: number;
  completionRate: number;
  totalAssignments: number;
  completedAssignments: number;
  spacedRepItems?: number;
}

const PerformanceChart: React.FC = () => {
  const [selectedStudent, setSelectedStudent] = useState<StudentPerformance | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['student-performance-chart'],
    queryFn: async () => {
      // Get teacher ID
      const { data: authData } = await supabase.auth.getUser();
      const teacherId = authData.user?.id;
      
      if (!teacherId) throw new Error("Não autenticado");
      
      // Get teacher's students through invitations
      const { data: invitedStudents, error: invError } = await supabase
        .from('student_invitations')
        .select('user_id, email')
        .eq('invited_by', teacherId)
        .eq('status', 'accepted')
        .not('user_id', 'is', null);
        
      if (invError) {
        console.error('Erro ao buscar convites de alunos:', invError);
        return {
          chartData: [],
          studentsData: []
        };
      }
      
      // Extract student IDs from invitations
      const studentIds = invitedStudents
        ?.filter(invitation => invitation.user_id)
        .map(invitation => invitation.user_id) || [];
      
      if (studentIds.length === 0) {
        return {
          chartData: [],
          studentsData: []
        }; // Nenhum aluno encontrado
      }
      
      // Get student profiles for names
      const { data: studentProfiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, avatar_url')
        .in('id', studentIds);
        
      if (profilesError) {
        console.error('Erro ao buscar perfis dos alunos:', profilesError);
      }
      
      // Create a map of student IDs to student names
      const studentNames: Record<string, string> = {};
      const studentAvatars: Record<string, string> = {};
      studentProfiles?.forEach(profile => {
        studentNames[profile.id] = `${profile.first_name} ${profile.last_name}`;
        studentAvatars[profile.id] = profile.avatar_url;
      });
      
      // Get quiz attempts only for teacher's students
      const { data: quizAttempts, error: quizError } = await supabase
        .from('user_quiz_attempts')
        .select('quiz_id, score, user_id, lesson_id')
        .in('user_id', studentIds)
        .order('started_at', { ascending: false });
      
      if (quizError) {
        console.error('Erro ao buscar tentativas de quiz:', quizError);
      }
      
      // Process data for chart
      const studentPerformance: Record<string, any> = {};
      
      quizAttempts?.forEach(attempt => {
        const studentId = attempt.user_id;
        const studentName = studentNames[studentId] || `Aluno ${studentId.slice(0, 5)}`;
        
        if (!studentPerformance[studentId]) {
          studentPerformance[studentId] = {
            id: studentId, 
            name: studentName,
            avatar: studentAvatars[studentId] || null,
            quizAvg: 0,
            quizCount: 0,
            quizTotal: 0,
            lessonData: {}
          };
        }
        
        // Acompanhar desempenho por lição
        if (!studentPerformance[studentId].lessonData[attempt.lesson_id]) {
          studentPerformance[studentId].lessonData[attempt.lesson_id] = {
            scores: [],
            attempts: 0,
            avgScore: 0
          };
        }
        
        studentPerformance[studentId].lessonData[attempt.lesson_id].scores.push(attempt.score);
        studentPerformance[studentId].lessonData[attempt.lesson_id].attempts += 1;
        studentPerformance[studentId].lessonData[attempt.lesson_id].avgScore = 
          studentPerformance[studentId].lessonData[attempt.lesson_id].scores.reduce((a: number, b: number) => a + b, 0) / 
          studentPerformance[studentId].lessonData[attempt.lesson_id].attempts;
        
        studentPerformance[studentId].quizTotal += attempt.score;
        studentPerformance[studentId].quizCount += 1;
        studentPerformance[studentId].quizAvg = Math.round(
          studentPerformance[studentId].quizTotal / studentPerformance[studentId].quizCount
        );
      });
      
      // Obter dados de tarefas concluídas
      const { data: assignments, error: assignmentsError } = await supabase
        .from('student_assignments')
        .select('status, student_id, completed_at, assigned_at, lesson:lesson_id(title)')
        .in('student_id', studentIds)
        .eq('assigned_by', teacherId);
        
      if (assignmentsError) {
        console.error('Erro ao buscar tarefas dos alunos:', assignmentsError);
      }
      
      // Processar dados de tarefas
      assignments?.forEach(assignment => {
        const studentId = assignment.student_id;
        const studentName = studentNames[studentId] || `Aluno ${studentId.slice(0, 5)}`;
        
        if (!studentPerformance[studentId]) {
          studentPerformance[studentId] = {
            id: studentId, 
            name: studentName,
            avatar: studentAvatars[studentId] || null,
            quizAvg: 0,
            quizCount: 0,
            quizTotal: 0,
            completionRate: 0,
            totalAssignments: 0,
            completedAssignments: 0,
            assignments: [],
            lessonData: {}
          };
        }
        
        if (!studentPerformance[studentId].assignments) {
          studentPerformance[studentId].assignments = [];
        }
        
        studentPerformance[studentId].assignments.push({
          status: assignment.status,
          completedAt: assignment.completed_at,
          assignedAt: assignment.assigned_at,
          lessonTitle: assignment.lesson?.title || 'Lição desconhecida'
        });
        
        if (!studentPerformance[studentId].totalAssignments) {
          studentPerformance[studentId].totalAssignments = 0;
          studentPerformance[studentId].completedAssignments = 0;
        }
        
        studentPerformance[studentId].totalAssignments += 1;
        if (assignment.status === 'completed') {
          studentPerformance[studentId].completedAssignments += 1;
        }
        
        studentPerformance[studentId].completionRate = Math.round(
          (studentPerformance[studentId].completedAssignments / 
           studentPerformance[studentId].totalAssignments) * 100
        );
      });
      
      // Obter dados de repetição espaçada
      const { data: spacedRepItems, error: spacedError } = await supabase
        .from('spaced_repetition_items')
        .select('user_id, status, next_review_at')
        .in('user_id', studentIds);
        
      if (spacedError) {
        console.error('Erro ao buscar itens de repetição espaçada:', spacedError);
      }
      
      spacedRepItems?.forEach(item => {
        const studentId = item.user_id;
        
        if (studentPerformance[studentId]) {
          if (!studentPerformance[studentId].spacedRepItems) {
            studentPerformance[studentId].spacedRepItems = 0;
          }
          studentPerformance[studentId].spacedRepItems += 1;
        }
      });
      
      // Convert to array for both chart and student list
      const studentsData = Object.values(studentPerformance);
      
      // Format data specifically for chart display
      const chartData = studentsData
        .filter((student: any) => student.quizCount > 0 || student.totalAssignments > 0)
        .sort((a: any, b: any) => b.quizAvg - a.quizAvg)
        .slice(0, 7)
        .map((student: any) => ({
          name: student.name,
          quizScore: student.quizAvg || 0,
          completionRate: student.completionRate || 0
        }));
        
      return {
        chartData,
        studentsData
      };
    }
  });

  const chartConfig = {
    quizScore: { 
      label: "Pontuação Quiz",
      color: "#4f46e5"
    },
    completionRate: { 
      label: "Taxa de Conclusão",
      color: "#10b981"
    }
  };
  
  const openStudentDetails = (student: StudentPerformance) => {
    setSelectedStudent(student);
    setIsModalOpen(true);
  };
  
  // Função para renderizar os badges de status
  const renderStatusBadge = (status: string) => {
    switch(status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800 border-green-300">Concluído</Badge>;
      case 'in_progress':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-300">Em progresso</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">Pendente</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 border-gray-300">{status}</Badge>;
    }
  };

  return (
    <>
      <Card className="col-span-1 md:col-span-2">
        <CardHeader>
          <CardTitle>Desempenho dos Alunos</CardTitle>
          <CardDescription>
            Comparação do desempenho dos alunos em diferentes métricas
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="w-full h-[200px]" />
              <div className="grid grid-cols-1 gap-4">
                {[1, 2, 3].map(i => (
                  <Skeleton key={i} className="w-full h-[80px]" />
                ))}
              </div>
            </div>
          ) : data?.studentsData && data.studentsData.length > 0 ? (
            <div className="space-y-8">
              {/* Gráfico de desempenho */}
              {data.chartData && data.chartData.length > 0 && (
                <div className="w-full aspect-[2/1]">
                  <ChartContainer config={chartConfig}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={data.chartData}
                        margin={{
                          top: 20,
                          right: 30,
                          left: 20,
                          bottom: 60,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="name" 
                          angle={-45} 
                          textAnchor="end"
                          tick={{ fontSize: 12 }}
                          height={60}
                        />
                        <YAxis />
                        <ChartTooltip
                          content={<ChartTooltipContent nameKey="name" />}
                        />
                        <Legend />
                        <Bar dataKey="quizScore" fill="#4f46e5" name="Pontuação Quiz" />
                        <Bar dataKey="completionRate" fill="#10b981" name="Taxa de Conclusão" />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>
              )}
              
              {/* Lista de alunos com métricas resumidas */}
              <div className="grid grid-cols-1 gap-4">
                {data.studentsData
                  .sort((a: any, b: any) => b.quizAvg - a.quizAvg)
                  .map((student: StudentPerformance) => (
                    <Card 
                      key={student.id} 
                      className="overflow-hidden hover:bg-muted/40 transition-colors cursor-pointer"
                      onClick={() => openStudentDetails(student)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                              {student.avatar ? (
                                <img 
                                  src={student.avatar} 
                                  alt={student.name} 
                                  className="h-10 w-10 rounded-full object-cover" 
                                />
                              ) : (
                                <span className="text-primary font-bold">
                                  {student.name.substring(0, 2).toUpperCase()}
                                </span>
                              )}
                            </div>
                            <div>
                              <h3 className="font-medium">{student.name}</h3>
                              <p className="text-sm text-muted-foreground">
                                {student.totalAssignments || 0} tarefas atribuídas
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex gap-6">
                            <div className="text-center">
                              <p className="text-sm text-muted-foreground">Quizzes</p>
                              <p className="font-bold text-lg">{student.quizAvg || 0}%</p>
                            </div>
                            
                            <div className="text-center">
                              <p className="text-sm text-muted-foreground">Conclusão</p>
                              <p className="font-bold text-lg">{student.completionRate || 0}%</p>
                            </div>
                            
                            <div className="text-center">
                              <p className="text-sm text-muted-foreground">Rep. Espaçada</p>
                              <p className="font-bold text-lg">{student.spacedRepItems || 0}</p>
                            </div>
                          </div>
                          
                          <Button size="sm" variant="ghost">
                            Ver detalhes
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum dado de desempenho disponível ainda
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Modal de detalhes do aluno */}
      {selectedStudent && (
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle className="text-xl">Desempenho de {selectedStudent.name}</DialogTitle>
              <DialogDescription>
                Detalhes completos do desempenho do aluno em diferentes áreas
              </DialogDescription>
            </DialogHeader>
            
            <Tabs defaultValue="overview" className="mt-4">
              <TabsList className="grid grid-cols-4 mb-4">
                <TabsTrigger value="overview">Visão Geral</TabsTrigger>
                <TabsTrigger value="lessons">Lições e Quizzes</TabsTrigger>
                <TabsTrigger value="assignments">Tarefas</TabsTrigger>
                <TabsTrigger value="spacedRep">Repetição Espaçada</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="pt-6 flex flex-col items-center justify-center h-full">
                      <Award className="h-8 w-8 text-primary mb-2" />
                      <h3 className="text-xl font-bold">{selectedStudent.quizAvg || 0}%</h3>
                      <p className="text-sm text-muted-foreground">Pontuação média em quizzes</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="pt-6 flex flex-col items-center justify-center h-full">
                      <CheckCircle2 className="h-8 w-8 text-green-500 mb-2" />
                      <h3 className="text-xl font-bold">{selectedStudent.completionRate || 0}%</h3>
                      <p className="text-sm text-muted-foreground">Taxa de conclusão de tarefas</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="pt-6 flex flex-col items-center justify-center h-full">
                      <TrendingUp className="h-8 w-8 text-blue-500 mb-2" />
                      <h3 className="text-xl font-bold">{selectedStudent.spacedRepItems || 0}</h3>
                      <p className="text-sm text-muted-foreground">Itens em repetição espaçada</p>
                    </CardContent>
                  </Card>
                </div>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Resumo de Atividades</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">Quizzes completados</span>
                          <span className="text-sm font-medium">{selectedStudent.quizCount || 0}</span>
                        </div>
                        <Progress value={selectedStudent.quizCount ? 100 : 0} className="h-2" />
                      </div>
                      
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">Tarefas concluídas</span>
                          <span className="text-sm font-medium">
                            {selectedStudent.completedAssignments || 0} de {selectedStudent.totalAssignments || 0}
                          </span>
                        </div>
                        <Progress value={selectedStudent.completionRate || 0} className="h-2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="lessons" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Desempenho em Lições e Quizzes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {Object.keys(selectedStudent.lessonData || {}).length > 0 ? (
                      <div className="space-y-4">
                        {Object.entries(selectedStudent.lessonData || {}).map(([lessonId, data]: [string, any]) => (
                          <div key={lessonId} className="border rounded-md p-4">
                            <div className="flex justify-between items-center mb-2">
                              <h4 className="font-medium">Lição {lessonId}</h4>
                              <Badge>{data.attempts} tentativa(s)</Badge>
                            </div>
                            <div className="flex justify-between mb-1">
                              <span className="text-sm">Nota média</span>
                              <span className="text-sm font-medium">{Math.round(data.avgScore)}%</span>
                            </div>
                            <Progress value={data.avgScore} className="h-2" />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4 text-muted-foreground">
                        <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                        <p>Nenhum quiz foi concluído por este aluno ainda</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="assignments" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Histórico de Tarefas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedStudent.assignments && selectedStudent.assignments.length > 0 ? (
                      <div className="space-y-4">
                        {selectedStudent.assignments.map((assignment: any, index: number) => {
                          const assignedDate = new Date(assignment.assignedAt);
                          const completedDate = assignment.completedAt ? new Date(assignment.completedAt) : null;
                          const timeDiff = completedDate 
                            ? Math.round((completedDate.getTime() - assignedDate.getTime()) / (1000 * 60 * 60 * 24)) 
                            : null;
                            
                          return (
                            <div key={index} className="border rounded-md p-4">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h4 className="font-medium">{assignment.lessonTitle}</h4>
                                  <div className="flex items-center gap-2 mt-1">
                                    <Clock className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm text-muted-foreground">
                                      Atribuída em {assignedDate.toLocaleDateString()}
                                    </span>
                                  </div>
                                </div>
                                <div>
                                  {renderStatusBadge(assignment.status)}
                                </div>
                              </div>
                              
                              {completedDate && (
                                <div className="mt-2 text-sm">
                                  <span className="text-muted-foreground">Concluída em:</span>{' '}
                                  <span>{completedDate.toLocaleDateString()}</span>
                                  <span className="ml-2 text-muted-foreground">
                                    ({timeDiff} {timeDiff === 1 ? 'dia' : 'dias'})
                                  </span>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-4 text-muted-foreground">
                        <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                        <p>Nenhuma tarefa foi atribuída a este aluno ainda</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="spacedRep" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Repetição Espaçada</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-4">
                      <div className="bg-primary/10 rounded-full h-20 w-20 flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl font-bold">{selectedStudent.spacedRepItems || 0}</span>
                      </div>
                      <h3 className="text-lg font-medium mb-2">Total de itens em repetição</h3>
                      <p className="text-muted-foreground max-w-md mx-auto">
                        Quantidade de itens que o aluno está revisando usando o sistema de repetição espaçada.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default PerformanceChart;
