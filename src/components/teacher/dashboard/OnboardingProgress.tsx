
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
      // First get all students
      const { data: students, error: studentsError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name')
        .eq('role', 'student');

      if (studentsError) throw studentsError;
      if (!students || students.length === 0) {
        return {
          totalStudents: 0,
          completedOnboarding: 0,
          inProgressOnboarding: 0,
          notStartedOnboarding: 0,
          averageProgress: 0
        };
      }

      // Then get onboarding data for these students
      const studentIds = students.map(s => s.id);
      const { data: onboardingData, error: onboardingError } = await supabase
        .from('user_onboarding')
        .select('user_id, current_step_index, completed_steps')
        .in('user_id', studentIds);

      if (onboardingError) throw onboardingError;

      // Process the data
      const totalStudents = students.length;
      const studentOnboarding = onboardingData || [];
      
      // Map onboarding data to students
      const studentsWithOnboarding = students.map(student => {
        const onboarding = studentOnboarding.find(o => o.user_id === student.id);
        return {
          ...student,
          onboarding: onboarding || null
        };
      });
      
      const completedOnboarding = studentsWithOnboarding.filter(
        s => s.onboarding && s.onboarding.current_step_index >= 6
      ).length;
      
      const inProgressOnboarding = studentsWithOnboarding.filter(
        s => s.onboarding && s.onboarding.current_step_index > 0 && s.onboarding.current_step_index < 6
      ).length;
      
      const notStartedOnboarding = totalStudents - completedOnboarding - inProgressOnboarding;

      // Calculate average progress
      let totalSteps = 0;
      let completedSteps = 0;
      
      studentsWithOnboarding.forEach(student => {
        if (student.onboarding) {
          totalSteps += 7; // Total 7 onboarding steps
          completedSteps += student.onboarding.completed_steps?.length || 0;
        }
      });
      
      const averageProgress = totalSteps > 0 
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
          <CardTitle>Onboarding de Alunos</CardTitle>
          <CardDescription>Carregando dados de onboarding dos alunos...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Progresso de Onboarding dos Alunos</CardTitle>
        <CardDescription>Acompanhe o progresso dos seus alunos no processo de onboarding</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="flex justify-between mb-2">
            <span className="text-sm text-muted-foreground">Progresso Geral</span>
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
                  <p className="text-sm font-medium">Concluído</p>
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
                  <p className="text-sm font-medium">Em Progresso</p>
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
                  <p className="text-sm font-medium">Não Iniciado</p>
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
