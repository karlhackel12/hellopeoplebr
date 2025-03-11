
import React from 'react';
import StudentLayout from '@/components/layout/StudentLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useOnboarding } from '@/components/student/OnboardingContext';
import { LayoutDashboard, BookOpen, Clock, Trophy } from 'lucide-react';

const StudentDashboard: React.FC = () => {
  const { steps, isOnboardingComplete } = useOnboarding();
  const completedSteps = steps.filter(step => step.completed).length;
  const totalSteps = steps.length;
  const completionPercentage = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

  // Fetch student assignments
  const { data: assignments, isLoading: loadingAssignments } = useQuery({
    queryKey: ['student-assignments'],
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
          lesson_id,
          quiz_id,
          lessons:lesson_id (title),
          quizzes:quiz_id (title)
        `)
        .eq('student_id', user.id)
        .order('due_date', { ascending: true });
      
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch student progress
  const { data: lessonProgress, isLoading: loadingProgress } = useQuery({
    queryKey: ['student-lesson-progress'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('user_lesson_progress')
        .select(`
          id,
          completed,
          completed_at,
          last_accessed_at,
          lessons:lesson_id (id, title)
        `)
        .eq('user_id', user.id);
      
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch quiz attempts
  const { data: quizAttempts, isLoading: loadingQuizzes } = useQuery({
    queryKey: ['student-quiz-attempts'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('user_quiz_attempts')
        .select(`
          id,
          score,
          passed,
          completed_at,
          time_spent_seconds,
          quizzes:quiz_id (id, title)
        `)
        .eq('user_id', user.id)
        .order('completed_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    }
  });

  const upcomingAssignments = assignments?.filter(a => a.status !== 'completed').slice(0, 5) || [];
  const completedLessons = lessonProgress?.filter(lp => lp.completed) || [];
  const totalLessons = lessonProgress?.length || 0;
  const lessonCompletionPercentage = totalLessons > 0 ? Math.round((completedLessons.length / totalLessons) * 100) : 0;

  return (
    <StudentLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Student Dashboard</h1>
            <p className="text-muted-foreground">
              {!isOnboardingComplete ? 'Complete your onboarding to get started!' : 'Monitor your progress and upcoming lessons'}
            </p>
          </div>
        </div>

        {!isOnboardingComplete && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium">Onboarding Progress</CardTitle>
              <CardDescription>Complete all steps to start learning</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{completedSteps} of {totalSteps} steps completed</span>
                  <span className="font-medium">{completionPercentage}%</span>
                </div>
                <Progress value={completionPercentage} className="h-2" />
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Lessons Completed</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedLessons.length} / {totalLessons}</div>
              <div className="mt-2">
                <Progress value={lessonCompletionPercentage} className="h-2" />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {lessonCompletionPercentage}% complete
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Upcoming Deadlines</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {upcomingAssignments.filter(a => a.due_date).length}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Assignments with upcoming deadlines
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Quizzes Passed</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {quizAttempts?.filter(q => q.passed).length || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Out of {quizAttempts?.length || 0} attempts
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="upcoming">
          <TabsList>
            <TabsTrigger value="upcoming">Upcoming Assignments</TabsTrigger>
            <TabsTrigger value="recent">Recent Activity</TabsTrigger>
          </TabsList>
          
          <TabsContent value="upcoming" className="space-y-4 mt-4">
            {loadingAssignments ? (
              <div className="text-center py-8">Loading assignments...</div>
            ) : upcomingAssignments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No upcoming assignments
              </div>
            ) : (
              <div className="space-y-2">
                {upcomingAssignments.map((assignment) => (
                  <Card key={assignment.id}>
                    <CardHeader className="p-4 pb-2">
                      <CardTitle className="text-base">{assignment.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <p className="text-sm text-muted-foreground mb-2">
                        {assignment.lesson_id 
                          ? `Lesson: ${assignment.lessons?.title}` 
                          : `Quiz: ${assignment.quizzes?.title}`}
                      </p>
                      
                      {assignment.due_date && (
                        <p className="text-sm">
                          <span className="font-medium">Due:</span>{' '}
                          {new Date(assignment.due_date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </p>
                      )}
                      
                      <div className="mt-3">
                        <div className={`text-xs px-2 py-1 rounded-full inline-block ${
                          assignment.status === 'in_progress' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {assignment.status === 'in_progress' ? 'In Progress' : 'Not Started'}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="recent" className="space-y-4 mt-4">
            {loadingProgress && loadingQuizzes ? (
              <div className="text-center py-8">Loading activity...</div>
            ) : (quizAttempts?.length === 0 && completedLessons.length === 0) ? (
              <div className="text-center py-8 text-muted-foreground">
                No recent activity
              </div>
            ) : (
              <div className="space-y-2">
                {quizAttempts?.slice(0, 3).map((attempt) => (
                  <Card key={attempt.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{attempt.quizzes?.title}</p>
                          <p className="text-sm text-muted-foreground">Quiz Attempt</p>
                        </div>
                        <div className={`text-sm px-2 py-1 rounded-full ${
                          attempt.passed 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {attempt.passed ? 'Passed' : 'Failed'} ({attempt.score}%)
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                {completedLessons.slice(0, 3).map((progress) => (
                  <Card key={progress.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{progress.lessons?.title}</p>
                          <p className="text-sm text-muted-foreground">Lesson Completed</p>
                        </div>
                        <div className="text-sm px-2 py-1 rounded-full bg-green-100 text-green-800">
                          Completed
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </StudentLayout>
  );
};

export default StudentDashboard;
