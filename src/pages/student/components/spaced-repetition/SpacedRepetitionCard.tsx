
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { BrainCircuit, CheckCircle, Star, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';

interface SpacedRepetitionCardProps {
  dueItemsCount: number;
  totalReviews?: number;
  bestStreak?: number;
  averageScore?: number;
  totalPoints?: number;
  loading?: boolean;
}

const SpacedRepetitionCard: React.FC<SpacedRepetitionCardProps> = ({
  dueItemsCount,
  totalReviews = 0,
  bestStreak = 0,
  averageScore = 0,
  totalPoints = 0,
  loading = false,
}) => {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-4 w-full mt-2" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-16 w-full" />
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </CardContent>
        <CardFooter>
          <Skeleton className="h-10 w-full" />
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BrainCircuit className="h-5 w-5 text-purple-500" /> Prática de Revisão
        </CardTitle>
        <CardDescription>
          Revise o conteúdo para memorização de longo prazo
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-purple-50 dark:bg-purple-950/20 rounded-lg p-4 border border-purple-100 dark:border-purple-800">
          <div className="text-center">
            <h3 className="text-3xl font-bold text-purple-600 dark:text-purple-400">{dueItemsCount}</h3>
            <p className="text-sm text-purple-700 dark:text-purple-300">
              {dueItemsCount === 1 ? 'item' : 'itens'} para revisar hoje
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3 text-center">
            <div className="flex justify-center text-amber-500 mb-1">
              <Star className="h-5 w-5" />
            </div>
            <div className="text-lg font-semibold">{totalPoints}</div>
            <div className="text-xs text-muted-foreground">Pontos</div>
          </div>
          
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3 text-center">
            <div className="flex justify-center text-green-500 mb-1">
              <CheckCircle className="h-5 w-5" />
            </div>
            <div className="text-lg font-semibold">{totalReviews}</div>
            <div className="text-xs text-muted-foreground">Revisões</div>
          </div>
        </div>
      </CardContent>
      
      <CardFooter>
        {dueItemsCount > 0 ? (
          <Button className="w-full bg-purple-600 hover:bg-purple-700" asChild>
            <Link to="/student/spaced-repetition/review">Iniciar Revisão</Link>
          </Button>
        ) : (
          <Button className="w-full" disabled>
            Nenhum item para revisar
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default SpacedRepetitionCard;
