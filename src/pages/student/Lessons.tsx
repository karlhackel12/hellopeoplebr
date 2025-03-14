
import React from 'react';
import StudentLayout from '@/components/layout/StudentLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, BookOpen, Clock, Star, Trophy, Activity, Zap, ArrowRight, Calendar, List, Info } from 'lucide-react';
import { format, isPast, isToday, isTomorrow, addDays } from 'date-fns';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import AssignmentCard from '@/components/student/AssignmentCard';
import GardenProgress from '@/components/ui/garden-progress';

const StudentLessons: React.FC = () => {
  // Fetch student assignments (lessons and quizzes)
  const { data: assignments, isLoading: loadingAssignments } = useQuery({
    queryKey: ['student-lesson-assignments'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('student_assignments')
        .select(`
          id,
          title,
          description,
          due_date,
          status,
          created_at,
          lesson_id,
          quiz_id,
          lessons:lesson_id (
            id, 
            title, 
            content,
            estimated_minutes
          ),
          quizzes:quiz_id (
            id, 
            title
          )
        `)
        .eq('student_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch lesson progress
  const { data: progressData, isLoading: loadingProgress } = useQuery({
    queryKey: ['student-all-lesson-progress'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('user_lesson_progress')
        .select('lesson_id, completed, last_accessed_at')
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      // Convert to a map for easy lookup
      const progressMap = new Map();
      data?.forEach(item => {
        progressMap.set(item.lesson_id, item);
      });
      
      return progressMap;
    }
  });

  const isLoading = loadingAssignments || loadingProgress;
  
  // Filter assignments by type and status
  const pendingAssignments = assignments?.filter(a => a.status === 'not_started') || [];
  const inProgressAssignments = assignments?.filter(a => a.status === 'in_progress') || [];
  const completedAssignments = assignments?.filter(a => a.status === 'completed') || [];
  const dueSoonAssignments = assignments?.filter(a => 
    a.due_date && 
    (isToday(new Date(a.due_date)) || isTomorrow(new Date(a.due_date))) && 
    a.status !== 'completed'
  ) || [];
  
  // Calculate learning stats
  const totalAssignments = assignments?.length || 0;
  const completedCount = completedAssignments?.length || 0;
  const inProgressCount = inProgressAssignments?.length || 0;
  const completionRate = totalAssignments > 0 ? Math.round((completedCount / totalAssignments) * 100) : 0;
  const averageCompletionTimeInDays = 7; // This would be calculated from actual data
  
  function getLessonProgress(lessonId: string) {
    if (!progressData) return null;
    return progressData.get(lessonId);
  }

  return (
    <StudentLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">My Lessons</h1>
            <p className="text-muted-foreground">Track your learning progress and upcoming assignments</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Learning Dashboard Card */}
          <Card className="relative overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-primary via-primary/90 to-primary/80 text-white">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl mb-1 flex items-center gap-2">
                    <BookOpen className="h-5 w-5" /> Learning Dashboard
                  </CardTitle>
                  <CardDescription className="text-slate-100 opacity-90">
                    Track your learning journey
                  </CardDescription>
                </div>
                <div className="bg-white/20 px-3 py-1.5 rounded-full flex items-center gap-1.5">
                  <Star className="h-4 w-4 text-yellow-300 fill-yellow-300" />
                  <span className="font-bold">{completedCount}</span>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="pt-4">
              {isLoading ? (
                <div className="py-8 flex flex-col gap-4">
                  <Skeleton className="h-8 w-32" />
                  <Skeleton className="h-4 w-48" />
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-20 w-full" />
                  </div>
                </div>
              ) : (
                <>
                  <div className="mb-5">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-muted-foreground">Completion rate</span>
                      <span className="text-sm font-medium">{completionRate}%</span>
                    </div>
                    <Progress 
                      value={completionRate} 
                      className="h-2" 
                      indicatorClassName={completionRate > 75 ? "bg-green-500" : completionRate > 25 ? "bg-yellow-500" : "bg-red-500"} 
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="border rounded-lg p-3 flex flex-col items-center justify-center">
                      <Trophy className="h-5 w-5 text-amber-500 mb-1" />
                      <div className="text-lg font-bold">{completedCount}</div>
                      <div className="text-xs text-muted-foreground">Completed</div>
                    </div>
                    
                    <div className="border rounded-lg p-3 flex flex-col items-center justify-center">
                      <Activity className="h-5 w-5 text-blue-500 mb-1" />
                      <div className="text-lg font-bold">{inProgressCount}</div>
                      <div className="text-xs text-muted-foreground">In Progress</div>
                    </div>
                    
                    <div className="border rounded-lg p-3 flex flex-col items-center justify-center">
                      <Clock className="h-5 w-5 text-indigo-500 mb-1" />
                      <div className="text-lg font-bold">{averageCompletionTimeInDays}</div>
                      <div className="text-xs text-muted-foreground">Avg. Days</div>
                    </div>
                    
                    <div className="border rounded-lg p-3 flex flex-col items-center justify-center">
                      <GardenProgress value={completionRate} className="flex items-center justify-center" />
                      <div className="text-xs text-muted-foreground mt-1">Growth</div>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
            
            <CardFooter className="border-t bg-slate-50 px-6">
              <Button 
                className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                disabled={isLoading || dueSoonAssignments.length === 0}
                onClick={() => document.getElementById('due-soon-tab')?.click()}
              >
                {dueSoonAssignments.length > 0 
                  ? `Start Due Soon Lessons (${dueSoonAssignments.length})` 
                  : "No Lessons Due Soon"}
              </Button>
            </CardFooter>
          </Card>
          
          {/* Learning Tips Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Info className="h-5 w-5" /> Learning Tips
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-sm">
                <p>
                  <strong>Effective learning</strong> requires regular practice and active engagement 
                  with the material. Here are some tips to maximize your learning:
                </p>
                <div className="flex items-start gap-2">
                  <Clock className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                  <p>
                    <strong>Schedule regular study sessions</strong> - Consistent short sessions are more
                    effective than occasional cramming.
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <Trophy className="h-5 w-5 text-amber-500 mt-1 flex-shrink-0" />
                  <p>
                    <strong>Test yourself frequently</strong> - Use the quizzes and then add questions
                    to your spaced repetition system to improve long-term memory.
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <Zap className="h-5 w-5 text-yellow-500 mt-1 flex-shrink-0" />
                  <p>
                    <strong>Apply what you learn</strong> - Try to use new concepts in real-world
                    scenarios to solidify your understanding.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="all">
          <TabsList className="w-full sm:w-auto flex flex-wrap">
            <TabsTrigger value="all" className="flex items-center gap-1.5">
              <List className="h-4 w-4" /> All Lessons
            </TabsTrigger>
            <TabsTrigger value="in-progress" className="flex items-center gap-1.5">
              <Activity className="h-4 w-4" /> In Progress
            </TabsTrigger>
            <TabsTrigger id="due-soon-tab" value="due-soon" className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" /> Due Soon
            </TabsTrigger>
            <TabsTrigger value="completed" className="flex items-center gap-1.5">
              <Trophy className="h-4 w-4" /> Completed
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="mt-6">
            <RenderAssignments 
              assignments={assignments} 
              isLoading={isLoading} 
              getProgress={getLessonProgress} 
            />
          </TabsContent>
          
          <TabsContent value="in-progress" className="mt-6">
            <RenderAssignments 
              assignments={inProgressAssignments} 
              isLoading={isLoading}
              emptyMessage="No lessons in progress" 
              getProgress={getLessonProgress} 
            />
          </TabsContent>
          
          <TabsContent value="due-soon" className="mt-6">
            <RenderAssignments 
              assignments={dueSoonAssignments} 
              isLoading={isLoading}
              emptyMessage="No lessons due soon" 
              getProgress={getLessonProgress} 
            />
          </TabsContent>
          
          <TabsContent value="completed" className="mt-6">
            <RenderAssignments 
              assignments={completedAssignments} 
              isLoading={isLoading}
              emptyMessage="No completed lessons" 
              getProgress={getLessonProgress} 
            />
          </TabsContent>
        </Tabs>
      </div>
    </StudentLayout>
  );
};

interface RenderAssignmentsProps {
  assignments?: any[];
  isLoading: boolean;
  emptyMessage?: string;
  getProgress: (lessonId: string) => any;
}

const RenderAssignments: React.FC<RenderAssignmentsProps> = ({ 
  assignments, 
  isLoading, 
  emptyMessage = "No assignments found", 
  getProgress 
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="overflow-hidden">
            <CardHeader className="pb-2">
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full mb-4" />
              <div className="flex gap-2 mb-4">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }
  
  if (!assignments || assignments.length === 0) {
    return (
      <div className="text-center py-12 bg-muted/20 rounded-lg border border-dashed">
        <BookOpen className="h-12 w-12 text-muted-foreground/60 mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-1">{emptyMessage}</h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          You don't have any assignments in this category yet. 
          As you progress in your learning, they will appear here.
        </p>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {assignments.map((assignment) => (
        <AssignmentCard 
          key={assignment.id}
          assignment={assignment}
          progress={assignment.lesson_id ? getProgress(assignment.lesson_id) : null}
        />
      ))}
    </div>
  );
};

export default StudentLessons;
