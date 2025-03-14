
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Brain, Clock, Star, Trophy, Activity, Zap } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useNavigate } from 'react-router-dom';

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
      <CardHeader className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl mb-1 flex items-center gap-2">
              <Brain className="h-5 w-5" /> Spaced Repetition
            </CardTitle>
            <CardDescription className="text-slate-100 opacity-90">
              Remember more with less effort
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
          <div className="py-8 flex justify-center items-center">
            <div className="animate-pulse flex flex-col items-center">
              <div className="h-8 w-32 bg-slate-200 rounded mb-4"></div>
              <div className="h-4 w-48 bg-slate-200 rounded"></div>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-5">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-muted-foreground">Due for review</span>
                <span className="text-sm font-medium">{dueItemsCount} items</span>
              </div>
              <Progress 
                value={dueItemsCount > 0 ? 100 : 0} 
                className="h-2" 
                indicatorClassName={dueItemsCount > 0 ? "bg-purple-500" : "bg-green-500"} 
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="border rounded-lg p-3 flex flex-col items-center justify-center">
                <Trophy className="h-5 w-5 text-amber-500 mb-1" />
                <div className="text-lg font-bold">{bestStreak}</div>
                <div className="text-xs text-muted-foreground">Best Streak</div>
              </div>
              
              <div className="border rounded-lg p-3 flex flex-col items-center justify-center">
                <Activity className="h-5 w-5 text-blue-500 mb-1" />
                <div className="text-lg font-bold">{averageScore}</div>
                <div className="text-xs text-muted-foreground">Avg. Score</div>
              </div>
              
              <div className="border rounded-lg p-3 flex flex-col items-center justify-center">
                <Clock className="h-5 w-5 text-indigo-500 mb-1" />
                <div className="text-lg font-bold">{totalReviews}</div>
                <div className="text-xs text-muted-foreground">Total Reviews</div>
              </div>
              
              <div className="border rounded-lg p-3 flex flex-col items-center justify-center">
                <Zap className="h-5 w-5 text-yellow-500 mb-1" />
                <div className="text-lg font-bold">{totalPoints}</div>
                <div className="text-xs text-muted-foreground">Total Points</div>
              </div>
            </div>
          </>
        )}
      </CardContent>
      
      <CardFooter className="border-t bg-slate-50 px-6">
        <Button 
          onClick={startReview} 
          className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
          disabled={dueItemsCount === 0 || loading}
        >
          {dueItemsCount > 0 ? `Start Review (${dueItemsCount})` : "No Items Due"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default SpacedRepetitionCard;
