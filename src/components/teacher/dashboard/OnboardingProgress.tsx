
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Users, UserCheck, UserX } from 'lucide-react';

const OnboardingProgress: React.FC = () => {
  const { data: onboardingData, isLoading } = useQuery({
    queryKey: ['student-onboarding-progress'],
    queryFn: async () => {
      // Get students with their onboarding status
      const { data: students, error } = await supabase
        .from('profiles')
        .select(`
          id,
          first_name,
          last_name,
          user_onboarding (
            current_step_index,
            completed_steps
          )
        `)
        .eq('role', 'student');

      if (error) throw error;

      // Process the data
      const totalStudents = students.length;
      const completedOnboarding = students.filter(
        s => s.user_onboarding && s.user_onboarding.current_step_index >= 6
      ).length;
      const inProgressOnboarding = students.filter(
        s => s.user_onboarding && s.user_onboarding.current_step_index > 0 && s.user_onboarding.current_step_index < 6
      ).length;
      const notStartedOnboarding = totalStudents - completedOnboarding - inProgressOnboarding;

      // Calculate average progress
      let totalSteps = 0;
      let completedSteps = 0;
      
      students.forEach(student => {
        if (student.user_onboarding) {
          totalSteps += 7; // Total 7 onboarding steps
          completedSteps += student.user_onboarding.completed_steps?.length || 0;
        }
      });
      
      const averageProgress = totalStudents > 0 
        ? Math.round((completedSteps / totalSteps) * 100) 
        : 0;

      return {
        totalStudents,
        completedOnboarding,
        inProgressOnboarding,
        notStartedOnboarding,
        averageProgress
      };
    }
  });

  if (isLoading) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Student Onboarding</CardTitle>
          <CardDescription>Loading student onboarding data...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Student Onboarding Progress</CardTitle>
        <CardDescription>Track your students' progress through the onboarding process</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="flex justify-between mb-2">
            <span className="text-sm text-muted-foreground">Overall Progress</span>
            <span className="text-sm font-medium">{onboardingData?.averageProgress || 0}%</span>
          </div>
          <Progress value={onboardingData?.averageProgress || 0} className="h-2" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="mr-4 rounded-full bg-primary/10 p-2">
                  <UserCheck className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">Completed</p>
                  <p className="text-2xl font-bold">{onboardingData?.completedOnboarding || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="mr-4 rounded-full bg-orange-500/10 p-2">
                  <Users className="h-4 w-4 text-orange-500" />
                </div>
                <div>
                  <p className="text-sm font-medium">In Progress</p>
                  <p className="text-2xl font-bold">{onboardingData?.inProgressOnboarding || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="mr-4 rounded-full bg-destructive/10 p-2">
                  <UserX className="h-4 w-4 text-destructive" />
                </div>
                <div>
                  <p className="text-sm font-medium">Not Started</p>
                  <p className="text-2xl font-bold">{onboardingData?.notStartedOnboarding || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
};

export default OnboardingProgress;
