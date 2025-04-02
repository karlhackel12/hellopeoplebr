
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Brain, Clock, Star, Trophy, Activity, Zap } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useNavigate } from 'react-router-dom';
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
  loading = false
}) => {
  const navigate = useNavigate();
  
  const startReview = () => {
    navigate('/student/spaced-repetition/review');
  };
  
  return (
    <Card className="relative overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-[#9b87f5] via-[#a794f6] to-[#b3a1f7] text-white">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl mb-1 flex items-center gap-2">
              <Brain className="h-5 w-5" /> Repetição Espaçada
            </CardTitle>
            <CardDescription className="text-white/90">
              Memorize palavras e frases com eficiência
            </CardDescription>
          </div>
          <div className="bg-white/20 px-3 py-1.5 rounded-full flex items-center gap-1.5">
            <Star className="h-4 w-4 text-yellow-300 fill-yellow-300" />
            <span className="font-bold">{totalPoints}</span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-4">
        {loading ? (
          <div className="py-4 space-y-4">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-4 w-full" />
            <div className="grid grid-cols-2 gap-4 mt-2">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          </div>
        ) : (
          <>
            <div className="mb-5">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">
                  {dueItemsCount > 0 ? `${dueItemsCount} itens para revisar hoje` : "Nenhum item para revisar hoje"}
                </span>
                {dueItemsCount > 0 && (
                  <span className="text-sm bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                    <Clock className="h-3 w-3 inline mr-1" /> Agora
                  </span>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="border rounded-lg p-3 flex flex-col items-center justify-center">
                  <Activity className="h-5 w-5 text-blue-500 mb-1" />
                  <div className="text-lg font-bold">{totalReviews}</div>
                  <div className="text-xs text-muted-foreground">Revisões Totais</div>
                </div>
                
                <div className="border rounded-lg p-3 flex flex-col items-center justify-center">
                  <Trophy className="h-5 w-5 text-amber-500 mb-1" />
                  <div className="text-lg font-bold">{bestStreak}</div>
                  <div className="text-xs text-muted-foreground">Melhor Sequência</div>
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
      
      <CardFooter className="border-t bg-slate-50 px-6">
        <Button 
          onClick={startReview} 
          disabled={loading || dueItemsCount === 0}
          className="w-full bg-gradient-to-r from-[#9b87f5] to-[#a794f6] hover:from-[#8b77e5] hover:to-[#9784e6]"
        >
          {dueItemsCount > 0 ? "Iniciar Revisão" : "Nenhum Item para Revisar"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default SpacedRepetitionCard;
