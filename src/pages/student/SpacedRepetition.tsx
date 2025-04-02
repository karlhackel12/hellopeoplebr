
import React from 'react';
import StudentLayout from '@/components/layout/StudentLayout';
import { useSpacedRepetition } from './hooks/useSpacedRepetition';
import { useSpacedRepetitionAllItems } from './hooks/spaced-repetition/useSpacedRepetitionAllItems';
import SpacedRepetitionCard from './components/spaced-repetition/SpacedRepetitionCard';
import AboutCard from './components/spaced-repetition/AboutCard';
import SpacedRepetitionTabs from './components/spaced-repetition/SpacedRepetitionTabs';
import { Brain } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const SpacedRepetitionPage: React.FC = () => {
  const { dueItems, userStats, totalPoints, isLoading } = useSpacedRepetition();
  const { userId } = dueItems?.[0]?.user_id ? { userId: dueItems[0].user_id } : useSpacedRepetition();
  const { allItems, isLoading: isLoadingAllItems } = useSpacedRepetitionAllItems(userId);

  return (
    <StudentLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Brain className="h-6 w-6" /> Repetição Espaçada
          </h1>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          <SpacedRepetitionCard
            dueItemsCount={dueItems?.length || 0}
            totalReviews={userStats?.totalReviews}
            bestStreak={userStats?.bestStreak}
            averageScore={userStats?.averageScore}
            totalPoints={totalPoints}
            loading={isLoading}
          />
          
          <AboutCard />
        </div>
        
        {isLoading || isLoadingAllItems ? (
          <div className="rounded-lg border p-6">
            <Skeleton className="h-8 w-1/3 mb-6" />
            <div className="space-y-4">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          </div>
        ) : (
          <SpacedRepetitionTabs 
            dueItems={dueItems} 
            allItems={allItems}
            isLoading={isLoading || isLoadingAllItems} 
          />
        )}
      </div>
    </StudentLayout>
  );
};

export default SpacedRepetitionPage;
