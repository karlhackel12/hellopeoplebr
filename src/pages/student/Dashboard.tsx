import React, { useState } from 'react';
import StudentLayout from '@/components/layout/StudentLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart, Calendar, Sparkles, ArrowRight, Award, BookOpen, Check, Clock } from 'lucide-react';
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
import DashboardHeader from './components/dashboard/DashboardHeader';
const Dashboard: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const {
    userId
  } = useUser();
  const {
    streak,
    isLoading: isLoadingStreak
  } = useStudentStreak();
  const {
    stats,
    isLoading: isLoadingStats
  } = useStudentStats();
  const {
    goals,
    isLoading: isLoadingGoals
  } = useDailyGoals();
  const {
    dueAssignments,
    isLoading: isLoadingAssignments
  } = useStudentAssignments();
  const {
    recentLessons,
    isLoading: isLoadingLessons
  } = useRecentLessons();
  const {
    dueItems,
    isLoading: isLoadingDueItems
  } = useSpacedRepetitionDueItems(userId);
  const {
    userStats
  } = useSpacedRepetitionUserStats(userId);
  const {
    totalPoints
  } = useSpacedRepetitionPoints(userId);
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const isLoading = isLoadingStreak || isLoadingStats || isLoadingGoals || isLoadingAssignments || isLoadingLessons || isLoadingDueItems;
  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };
  return <>
      <DashboardHeader onMenuToggle={toggleMobileMenu} />
      <StudentLayout pageTitle="Painel" mobileMenuOpen={mobileMenuOpen} onMobileMenuClose={() => setMobileMenuOpen(false)}>
        <div className="space-y-6 pt-16 md:pt-0">
          {/* Streak Banner */}
          <Card className="border-primary/20 bg-gradient-to-r from-primary/10 to-primary/5">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center">
                <div className="mr-3 bg-primary/20 p-2 rounded-full">
                  <Award className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">Sequência Atual</h3>
                  <div className="text-2xl font-bold">
                    {isLoadingStreak ? <Skeleton className="h-8 w-16" /> : `${streak?.streakCount || 0} dias`}
                  </div>
                </div>
              </div>
              <Button variant="outline" className="bg-background border-primary/20 text-primary hover:bg-primary/20" onClick={() => navigate('/student/lessons')}>
                Continuar Sequência
              </Button>
            </CardContent>
          </Card>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4 flex flex-col items-center">
                <div className="bg-blue-50 p-2 rounded-full mb-2">
                  <BookOpen className="h-5 w-5 text-blue-500" />
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold">
                    {isLoadingStats ? <Skeleton className="h-7 w-10 mx-auto" /> : stats?.lessonsCompleted || 0}
                  </div>
                  <div className="text-xs text-muted-foreground">Aulas Concluídas</div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 flex flex-col items-center">
                <div className="bg-purple-50 p-2 rounded-full mb-2">
                  <Clock className="h-5 w-5 text-purple-500" />
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold">
                    {isLoadingStats ? <Skeleton className="h-7 w-16 mx-auto" /> : formatTime(stats?.totalMinutes || 0)}
                  </div>
                  <div className="text-xs text-muted-foreground">Tempo Total de Estudo</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Daily Goals */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <Sparkles className="h-5 w-5 mr-2 text-amber-500" />
                Metas Diárias
              </CardTitle>
              <CardDescription>Acompanhe seu progresso diário de aprendizado</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                {isLoadingGoals ? <>
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </> : goals?.map((goal, index) => <div key={index}>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">{goal.label.includes('Voice') ? 'Prática de Voz' : goal.label.includes('Vocabulary') ? 'Vocabulário' : 'Aulas'}</span>
                        <span className="text-sm font-medium">{goal.current}/{goal.target} {goal.label.includes('Voice') ? 'minutos' : goal.label.includes('Vocabulary') ? 'palavras' : 'concluídas'}</span>
                      </div>
                      <Progress value={goal.percentage} className="h-2" />
                    </div>)}
              </div>
            </CardContent>
          </Card>

          {/* Due Soon */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Próximos Prazos</h2>
              <Button variant="ghost" className="text-sm" onClick={() => navigate('/student/assignments')}>
                Ver Todos
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
            
            {isLoadingAssignments ? <Skeleton className="h-40 w-full" /> : dueAssignments && dueAssignments.length > 0 ? <div className="space-y-4">
                {dueAssignments.map(assignment => <AssignmentCard key={assignment.id} assignment={assignment} progress={assignment.progress} />)}
              </div> : <Card className="bg-muted/30">
                <CardContent className="p-6 text-center">
                  <Check className="h-12 w-12 text-primary/30 mx-auto mb-3" />
                  <h3 className="text-lg font-medium mb-1">Tudo em dia!</h3>
                  <p className="text-muted-foreground text-sm">
                    Você não tem tarefas pendentes.
                  </p>
                </CardContent>
              </Card>}
          </div>

          {/* Spaced Repetition Card */}
          <SpacedRepetitionCard dueItemsCount={dueItems?.length || 0} totalReviews={userStats?.totalReviews || 0} bestStreak={userStats?.bestStreak || 0} averageScore={userStats?.averageScore || 0} totalPoints={totalPoints || 0} loading={isLoadingDueItems} />

          {/* Recent Lessons */}
          
        </div>
      </StudentLayout>
    </>;
};
export default Dashboard;