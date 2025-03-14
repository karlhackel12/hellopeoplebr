
import React, { useState, useEffect } from 'react';
import StudentLayout from '@/components/layout/StudentLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart, Calendar, Sparkles, ArrowRight, Award, BookOpen, Check, Clock } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import LessonCard from '@/components/student/LessonCard';
import AssignmentCard from '@/components/student/AssignmentCard';
import SpacedRepetitionCard from '@/pages/student/components/spaced-repetition/SpacedRepetitionCard';
import { useIsMobile } from '@/hooks/use-mobile';
import { Skeleton } from '@/components/ui/skeleton';
import { useNavigate } from 'react-router-dom';

// This would be fetched from an API in a real app
const mockAssignments = [
  {
    id: '1',
    title: 'Present Simple Practice',
    description: 'Complete the lesson about Present Simple tense',
    status: 'not_started',
    due_date: new Date(Date.now() + 86400000 * 2).toISOString(),
    lesson_id: '123',
    lessons: {
      title: 'Present Simple Tense',
      estimated_minutes: 15
    }
  }
];

const mockLessons = [
  {
    id: '123',
    title: 'Present Simple Tense',
    description: 'Learn when and how to use the present simple tense in English',
    is_published: true
  },
  {
    id: '124',
    title: 'Common Phrasal Verbs',
    description: 'The most important phrasal verbs for everyday conversation',
    is_published: true
  }
];

const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [streakCount, setStreakCount] = useState(5);
  const [lessonsCompleted, setLessonsCompleted] = useState(8);
  const [totalMinutes, setTotalMinutes] = useState(120);
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Simulate data loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };
  
  return (
    <StudentLayout pageTitle="Dashboard">
      <div className="space-y-6">
        {/* Streak Banner */}
        <Card className="border-primary/20 bg-gradient-to-r from-primary/10 to-primary/5">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center">
              <div className="mr-3 bg-primary/20 p-2 rounded-full">
                <Award className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium">Current Streak</h3>
                <div className="text-2xl font-bold">{streakCount} days</div>
              </div>
            </div>
            <Button variant="outline" className="bg-background border-primary/20 text-primary hover:bg-primary/20">
              Continue Streak
            </Button>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4 flex flex-col items-center">
              <div className="bg-blue-50 p-2 rounded-full mb-2">
                <BookOpen className="h-5 w-5 text-blue-500" />
              </div>
              <div className="text-center">
                <div className="text-xl font-bold">{lessonsCompleted}</div>
                <div className="text-xs text-muted-foreground">Lessons Completed</div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 flex flex-col items-center">
              <div className="bg-purple-50 p-2 rounded-full mb-2">
                <Clock className="h-5 w-5 text-purple-500" />
              </div>
              <div className="text-center">
                <div className="text-xl font-bold">{formatTime(totalMinutes)}</div>
                <div className="text-xs text-muted-foreground">Total Learning Time</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Daily Goals */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Sparkles className="h-5 w-5 mr-2 text-amber-500" />
              Daily Goals
            </CardTitle>
            <CardDescription>Track your daily learning progress</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm">Vocabulary Practice</span>
                  <span className="text-sm font-medium">10/20 words</span>
                </div>
                <Progress value={50} className="h-2" />
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm">Voice Practice</span>
                  <span className="text-sm font-medium">5/10 minutes</span>
                </div>
                <Progress value={50} className="h-2" />
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm">Lessons</span>
                  <span className="text-sm font-medium">1/2 completed</span>
                </div>
                <Progress value={50} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Due Soon */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Due Soon</h2>
            <Button 
              variant="ghost" 
              className="text-sm" 
              onClick={() => navigate('/student/assignments')}
            >
              View All
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
          
          {loading ? (
            <Skeleton className="h-40 w-full" />
          ) : mockAssignments.length > 0 ? (
            <div className="space-y-4">
              {mockAssignments.map(assignment => (
                <AssignmentCard 
                  key={assignment.id} 
                  assignment={assignment}
                  progress={{ completed: false }}
                />
              ))}
            </div>
          ) : (
            <Card className="bg-muted/30">
              <CardContent className="p-6 text-center">
                <Check className="h-12 w-12 text-primary/30 mx-auto mb-3" />
                <h3 className="text-lg font-medium mb-1">All caught up!</h3>
                <p className="text-muted-foreground text-sm">
                  You don't have any pending assignments.
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Spaced Repetition Card */}
        <SpacedRepetitionCard 
          dueItemsCount={12}
          totalReviews={64}
          bestStreak={7}
          averageScore={85}
          totalPoints={420}
          loading={loading}
        />

        {/* Recent Lessons */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Recent Lessons</h2>
            <Button 
              variant="ghost" 
              className="text-sm"
              onClick={() => navigate('/student/lessons')}
            >
              View All
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
          
          {loading ? (
            <div className="grid grid-cols-1 gap-4">
              <Skeleton className="h-40 w-full" />
              <Skeleton className="h-40 w-full" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mockLessons.map(lesson => (
                <LessonCard 
                  key={lesson.id} 
                  lesson={lesson}
                  progress={{ completed: false }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </StudentLayout>
  );
};

export default Dashboard;
