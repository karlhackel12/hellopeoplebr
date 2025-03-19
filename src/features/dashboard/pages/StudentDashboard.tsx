import React, { useEffect } from 'react';
import StudentLayout from '@/components/layout/StudentLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, BookOpen, RefreshCw } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import LessonCard from '@/components/student/LessonCard';
import AssignmentCard from '@/components/student/AssignmentCard';
import SpacedRepetitionCard from '@/pages/student/components/spaced-repetition/SpacedRepetitionCard';
import { useIsMobile } from '@/hooks/use-mobile';
import { Skeleton } from '@/components/ui/skeleton';
import { useNavigate } from 'react-router-dom';
import { useStudentStreak } from './hooks/useStudentStreak';
import { useStudentStats } from './hooks/useStudentStats';
import { useDailyGoals } from './hooks/useDailyGoals';
import { useStudentAssignments } from './hooks/useStudentAssignments';
import { useRecentLessons } from './hooks/useRecentLessons';
import { useUser } from './hooks/spaced-repetition/useUser';
import { useSpacedRepetitionDueItems } from './hooks/spaced-repetition/useSpacedRepetitionDueItems';
import { useSpacedRepetitionUserStats } from './hooks/spaced-repetition/useSpacedRepetitionUserStats';
import { useSpacedRepetitionPoints } from './hooks/spaced-repetition/useSpacedRepetitionPoints';
import ActivitiesSummary from '@/components/student/dashboard/ActivitiesSummary';
import RecentActivities from '@/components/student/dashboard/RecentActivities';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const Dashboard: React.FC = () => {
  const { userId } = useUser();
  const { streak, isLoading: isLoadingStreak, refetch: refetchStreak } = useStudentStreak();
  const { stats, isLoading: isLoadingStats, refetch: refetchStats } = useStudentStats();
  const { goals, isLoading: isLoadingGoals, refetch: refetchGoals } = useDailyGoals();
  const { dueAssignments, isLoading: isLoadingAssignments, refetch: refetchAssignments } = useStudentAssignments();
  const { recentLessons, isLoading: isLoadingLessons, refetch: refetchLessons } = useRecentLessons();
  const { dueItems, isLoading: isLoadingDueItems, refetch: refetchDueItems } = useSpacedRepetitionDueItems(userId);
  const { userStats } = useSpacedRepetitionUserStats(userId);
  const { totalPoints, refetch: refetchPoints } = useSpacedRepetitionPoints(userId);
  
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  
  const isLoading = isLoadingStreak || isLoadingStats || isLoadingGoals || 
                    isLoadingAssignments || isLoadingLessons || isLoadingDueItems;
  
  // Configurar subscriptions para atualizações em tempo real
  useEffect(() => {
    const tables = [
      'user_lesson_progress',
      'voice_practice_sessions',
      'student_assignments',
      'spaced_repetition_items',
      'spaced_repetition_stats'
    ];
    
    const subscriptions = tables.map(table => 
      supabase
        .channel(`dashboard-${table}-changes`)
        .on('postgres_changes', { 
          event: '*', 
          schema: 'public', 
          table 
        }, () => {
          // Invalidar todas as queries relevantes
          queryClient.invalidateQueries({ queryKey: ['student-stats'] });
          queryClient.invalidateQueries({ queryKey: ['student-streak'] });
          queryClient.invalidateQueries({ queryKey: ['daily-goals'] });
          queryClient.invalidateQueries({ queryKey: ['student-assignments'] });
          queryClient.invalidateQueries({ queryKey: ['recent-lessons'] });
          queryClient.invalidateQueries({ queryKey: ['spaced-repetition-due-items'] });
          queryClient.invalidateQueries({ queryKey: ['spaced-repetition-points'] });
          queryClient.invalidateQueries({ queryKey: ['spaced-repetition-user-stats'] });
        })
        .subscribe()
    );
    
    return () => {
      subscriptions.forEach(subscription => 
        supabase.removeChannel(subscription)
      );
    };
  }, [queryClient]);
  
  // Função para atualizar todos os dados do dashboard
  const refreshAllData = () => {
    refetchStreak();
    refetchStats();
    refetchGoals();
    refetchAssignments();
    refetchLessons();
    refetchDueItems();
    refetchPoints();
  };
  
  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  return (
    <StudentLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold tracking-tight">Dashboard do Aluno</h1>
          <Button 
            variant="outline"
            size="sm"
            onClick={refreshAllData}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Atualizando...' : 'Atualizar dados'}
          </Button>
        </div>
        
        {/* Resumo de atividades */}
        <ActivitiesSummary />
        
        {/* Metas diárias */}
        <Card>
          <CardHeader>
            <CardTitle>Metas Diárias</CardTitle>
            <CardDescription>Seu progresso nas metas de hoje</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoadingGoals ? (
              <>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-8 w-full" />
              </>
            ) : goals?.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                Você ainda não tem metas definidas
              </div>
            ) : (
              goals?.map((goal) => (
                <div key={goal.id} className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">{goal.name}</span>
                    <span className="text-sm">{goal.current}/{goal.target} {goal.unit}</span>
                  </div>
                  <Progress value={(goal.current / goal.target) * 100} className="h-2" />
                </div>
              ))
            )}
          </CardContent>
        </Card>
        
        {/* Tarefas e Atividades */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Tarefas pendentes */}
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>Tarefas Pendentes</CardTitle>
              <CardDescription>Tarefas atribuídas pelo professor</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoadingAssignments ? (
                Array(2).fill(0).map((_, i) => (
                  <Skeleton key={i} className="h-24 w-full rounded-md" />
                ))
              ) : dueAssignments?.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  Você não tem nenhuma tarefa pendente
                </div>
              ) : (
                dueAssignments?.slice(0, 3).map((assignment) => (
                  <AssignmentCard key={assignment.id} assignment={assignment} />
                ))
              )}
              
              {dueAssignments && dueAssignments.length > 0 && (
                <Button
                  variant="outline"
                  className="w-full mt-2"
                  onClick={() => navigate('/student/assignments')}
                >
                  Ver todas as tarefas
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              )}
            </CardContent>
          </Card>
          
          {/* Atividades recentes */}
          <RecentActivities />
        </div>
        
        {/* Lições e Repetição Espaçada */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Lições Recentes */}
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>Continue Aprendendo</CardTitle>
              <CardDescription>Continue de onde parou</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoadingLessons ? (
                Array(2).fill(0).map((_, i) => (
                  <Skeleton key={i} className="h-24 w-full rounded-md" />
                ))
              ) : recentLessons?.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  Você ainda não iniciou nenhuma lição
                </div>
              ) : (
                recentLessons?.slice(0, 2).map((lesson) => (
                  <LessonCard key={lesson.lesson_id} lesson={lesson} />
                ))
              )}
              
              <Button
                variant="outline"
                className="w-full mt-2"
                onClick={() => navigate('/student/lessons')}
              >
                Ver todas as lições
                <BookOpen className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
          
          {/* Spaced Repetition */}
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>Repetição Espaçada</CardTitle>
              <CardDescription>Reforçe seu aprendizado com cartões de memória</CardDescription>
            </CardHeader>
            <CardContent>
              <SpacedRepetitionCard
                dueItemsCount={dueItems?.length || 0}
                totalReviews={userStats?.totalReviews}
                bestStreak={userStats?.bestStreak}
                averageScore={userStats?.averageScore}
                totalPoints={totalPoints}
                loading={isLoadingDueItems}
                compact={true}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </StudentLayout>
  );
};

export default Dashboard;
