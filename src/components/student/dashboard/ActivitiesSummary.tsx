import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, BookOpen, Brain, Mic, Award, Clock } from 'lucide-react';
import { useStudentStats } from '@/pages/student/hooks/useStudentStats';
import { Skeleton } from '@/components/ui/skeleton';
import { useStudentStreak } from '@/pages/student/hooks/useStudentStreak';
import { useSpacedRepetitionUserStats } from '@/pages/student/hooks/spaced-repetition/useSpacedRepetitionUserStats';
import { useUser } from '@/pages/student/hooks/spaced-repetition/useUser';

interface ActivityCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description: string;
  isLoading?: boolean;
}

const ActivityCard: React.FC<ActivityCardProps> = ({
  title,
  value,
  icon,
  description,
  isLoading = false
}) => (
  <div className="bg-card rounded-lg p-4 border">
    <div className="flex justify-between mb-2 items-center">
      <h3 className="font-medium text-sm">{title}</h3>
      {icon}
    </div>
    <div className="text-2xl font-bold mb-1">
      {isLoading ? <Skeleton className="h-8 w-20" /> : value}
    </div>
    <p className="text-xs text-muted-foreground">{description}</p>
  </div>
);

const ActivitiesSummary: React.FC = () => {
  const { userId } = useUser();
  const { stats, isLoading: isLoadingStats, refetch: refetchStats } = useStudentStats();
  const { streak, isLoading: isLoadingStreak, refetch: refetchStreak } = useStudentStreak();
  const { userStats } = useSpacedRepetitionUserStats(userId);
  
  const isLoadingAll = isLoadingStats || isLoadingStreak;
  
  const handleRefresh = () => {
    refetchStats();
    refetchStreak();
  };
  
  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  return (
    <Card>
      <CardHeader className="flex-row justify-between items-center pb-2">
        <CardTitle className="text-lg">Resumo de Atividades</CardTitle>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleRefresh} 
          disabled={isLoadingAll}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoadingAll ? 'animate-spin' : ''}`} />
          {isLoadingAll ? 'Atualizando...' : 'Atualizar'}
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <ActivityCard
            title="Lições Concluídas"
            value={stats?.lessonsCompleted || 0}
            icon={<BookOpen className="h-5 w-5 text-green-500" />}
            description="Total de lições finalizadas"
            isLoading={isLoadingStats}
          />
          
          <ActivityCard
            title="Sequência Atual"
            value={streak?.streakCount || 0}
            icon={<Award className="h-5 w-5 text-amber-500" />}
            description="Dias consecutivos de estudo"
            isLoading={isLoadingStreak}
          />
          
          <ActivityCard
            title="Tempo de Estudo"
            value={formatTime(stats?.totalMinutes || 0)}
            icon={<Clock className="h-5 w-5 text-blue-500" />}
            description="Tempo total dedicado"
            isLoading={isLoadingStats}
          />
          
          <ActivityCard
            title="Revisões"
            value={userStats?.totalReviews || 0}
            icon={<Brain className="h-5 w-5 text-purple-500" />}
            description="Cartões de memória revisados"
            isLoading={isLoadingStats}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default ActivitiesSummary; 