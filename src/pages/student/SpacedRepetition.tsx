
import React from 'react';
import StudentLayout from '@/components/layout/StudentLayout';
import { useSpacedRepetition } from './hooks/useSpacedRepetition';
import SpacedRepetitionCard from './components/spaced-repetition/SpacedRepetitionCard';
import AboutCard from './components/spaced-repetition/AboutCard';
import SpacedRepetitionTabs from './components/spaced-repetition/SpacedRepetitionTabs';
import { Brain } from 'lucide-react';

const SpacedRepetitionPage: React.FC = () => {
  const { dueItems, userStats, totalPoints, isLoading } = useSpacedRepetition();

  return (
    <StudentLayout>
      <div className="container mx-auto p-4 space-y-6">
        <h1 className="text-2xl font-bold mt-4 flex items-center gap-2">
          <Brain className="h-6 w-6" /> Spaced Repetition Dashboard
        </h1>
        
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
        
        <SpacedRepetitionTabs 
          dueItems={dueItems} 
          isLoading={isLoading} 
        />
      </div>
    </StudentLayout>
  );
};

export default SpacedRepetitionPage;
