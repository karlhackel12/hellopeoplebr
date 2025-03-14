
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, List } from 'lucide-react';
import ItemsList from './ItemsList';

type SpacedRepetitionTabsProps = {
  dueItems: any[] | null;
  isLoading: boolean;
};

const SpacedRepetitionTabs: React.FC<SpacedRepetitionTabsProps> = ({ 
  dueItems, 
  isLoading 
}) => {
  return (
    <Tabs defaultValue="due">
      <TabsList>
        <TabsTrigger value="due" className="flex items-center gap-1.5">
          <Calendar className="h-4 w-4" /> Due Items
        </TabsTrigger>
        <TabsTrigger value="all" className="flex items-center gap-1.5">
          <List className="h-4 w-4" /> All Items
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="due" className="mt-4">
        <Card>
          <CardContent className="p-4">
            <ItemsList 
              items={dueItems} 
              isLoading={isLoading}
              emptyTitle="No items due for review"
              emptyDescription="Great job! You've completed all your scheduled reviews. Check back later or complete more quizzes to add items to your review deck."
              icon="calendar"
            />
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="all" className="mt-4">
        <Card>
          <CardContent className="p-4">
            <ItemsList 
              items={dueItems} 
              isLoading={isLoading}
              emptyTitle="No review items yet"
              emptyDescription="Complete quizzes to automatically add questions to your spaced repetition deck. This helps you remember what you've learned over the long term."
              icon="list"
            />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

export default SpacedRepetitionTabs;
