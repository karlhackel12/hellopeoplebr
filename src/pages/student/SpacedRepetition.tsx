
import React from 'react';
import StudentLayout from '@/components/layout/StudentLayout';
import { useSpacedRepetition } from './hooks/useSpacedRepetition';
import SpacedRepetitionCard from './components/spaced-repetition/SpacedRepetitionCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Brain, Trophy, Clock, List, Calendar, Info } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

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
          
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Info className="h-5 w-5" /> About Spaced Repetition
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-sm">
                <p>
                  <strong>Spaced Repetition</strong> is a learning technique that incorporates increasing time intervals 
                  between reviews of previously learned material to exploit the psychological spacing effect.
                </p>
                <div className="flex items-start gap-2">
                  <Brain className="h-5 w-5 text-purple-500 mt-1 flex-shrink-0" />
                  <p>
                    The system automatically schedules reviews based on how well you remember each item, 
                    showing you difficult content more frequently and easy content less often.
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <Trophy className="h-5 w-5 text-amber-500 mt-1 flex-shrink-0" />
                  <p>
                    Earn points for each correctly answered question. The faster you answer and the 
                    better your recall, the more points you'll receive.
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <Clock className="h-5 w-5 text-blue-500 mt-1 flex-shrink-0" />
                  <p>
                    Just a few minutes of review each day can dramatically improve your long-term retention
                    of the material compared to cramming.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
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
                {isLoading ? (
                  <div className="py-8 flex justify-center items-center">
                    <div className="animate-pulse space-y-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="flex flex-col gap-2">
                          <div className="h-4 w-3/4 bg-slate-200 rounded"></div>
                          <div className="h-3 w-1/2 bg-slate-200 rounded"></div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : dueItems && dueItems.length > 0 ? (
                  <div className="divide-y">
                    {dueItems.map((item) => (
                      <div key={item.id} className="py-3 flex justify-between items-center">
                        <div>
                          <h3 className="font-medium">
                            {item.question?.question_text || item.lesson?.title || 'Unnamed item'}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Due: {formatDistanceToNow(new Date(item.next_review_date), { addSuffix: true })}
                          </p>
                        </div>
                        <div className="text-sm">
                          Difficulty: {Math.round(item.difficulty * 100) / 100}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center">
                    <div className="mx-auto w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                      <Calendar className="h-6 w-6 text-slate-500" />
                    </div>
                    <h3 className="text-lg font-medium mb-1">No items due for review</h3>
                    <p className="text-sm text-muted-foreground max-w-md mx-auto">
                      Great job! You've completed all your scheduled reviews. Check back later or complete
                      more quizzes to add items to your review deck.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="all" className="mt-4">
            <Card>
              <CardContent className="p-4">
                {isLoading ? (
                  <div className="py-8 flex justify-center items-center">
                    <div className="animate-pulse space-y-4">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="flex flex-col gap-2">
                          <div className="h-4 w-3/4 bg-slate-200 rounded"></div>
                          <div className="h-3 w-1/2 bg-slate-200 rounded"></div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : dueItems && dueItems.length > 0 ? (
                  <div className="divide-y">
                    {dueItems.map((item) => (
                      <div key={item.id} className="py-3 flex justify-between items-center">
                        <div>
                          <h3 className="font-medium">
                            {item.question?.question_text || item.lesson?.title || 'Unnamed item'}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Next review: {formatDistanceToNow(new Date(item.next_review_date), { addSuffix: true })}
                          </p>
                        </div>
                        <div className="text-sm">
                          Difficulty: {Math.round(item.difficulty * 100) / 100}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center">
                    <div className="mx-auto w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                      <List className="h-6 w-6 text-slate-500" />
                    </div>
                    <h3 className="text-lg font-medium mb-1">No review items yet</h3>
                    <p className="text-sm text-muted-foreground max-w-md mx-auto">
                      Complete quizzes to automatically add questions to your spaced repetition deck.
                      This helps you remember what you've learned over the long term.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </StudentLayout>
  );
};

export default SpacedRepetitionPage;
