import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Users, 
  BookOpen, 
  ClipboardCheck, 
  Brain,
  Award
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const AnalyticsCards: React.FC = () => {
  // Fetch analytics data
  const { data, isLoading } = useQuery({
    queryKey: ['teacher-analytics'],
    queryFn: async () => {
      const { data: authData } = await supabase.auth.getUser();
      const teacherId = authData.user?.id;
      
      if (!teacherId) throw new Error("Não autenticado");
      
      // Get student count - apenas alunos deste professor
      const { data: invitedStudents, count: studentsCount } = await supabase
        .from('student_invitations')
        .select('user_id', { count: 'exact' })
        .eq('invited_by', teacherId)
        .eq('status', 'accepted')
        .not('user_id', 'is', null);
      
      const studentIds = invitedStudents
        ?.filter(invitation => invitation.user_id)
        .map(invitation => invitation.user_id) || [];
      
      // Get lesson count
      const { count: lessonsCount } = await supabase
        .from('lessons')
        .select('*', { count: 'exact', head: true })
        .eq('created_by', teacherId);
      
      // Get assignment completion rate - apenas para os alunos deste professor
      const { data: assignments } = await supabase
        .from('student_assignments')
        .select('status')
        .eq('assigned_by', teacherId);
      
      const completedAssignments = assignments?.filter(a => a.status === 'completed').length || 0;
      const totalAssignments = assignments?.length || 0;
      const completionRate = totalAssignments > 0 
        ? Math.round((completedAssignments / totalAssignments) * 100) 
        : 0;
      
      // Average quiz score - apenas para os alunos deste professor
      const { data: quizAttempts } = await supabase
        .from('user_quiz_attempts')
        .select('score, user_id')
        .order('started_at', { ascending: false })
        .in('user_id', studentIds.length > 0 ? studentIds : ['no-students']);
      
      const totalScore = quizAttempts?.reduce((sum, attempt) => sum + attempt.score, 0) || 0;
      const averageScore = quizAttempts && quizAttempts.length > 0 
        ? Math.round(totalScore / quizAttempts.length) 
        : 0;
      
      // Spaced repetition items count - apenas para os alunos deste professor
      const { count: spacedRepetitionCount } = await supabase
        .from('spaced_repetition_items')
        .select('*', { count: 'exact', head: true })
        .in('user_id', studentIds.length > 0 ? studentIds : ['no-students']);
      
      return {
        studentsCount: studentsCount || 0,
        lessonsCount: lessonsCount || 0,
        assignmentCompletionRate: completionRate,
        averageQuizScore: averageScore,
        spacedRepetitionCount: spacedRepetitionCount || 0
      };
    }
  });

  const analyticsCards = [
    {
      title: 'Alunos',
      value: data?.studentsCount || 0,
      icon: Users,
      description: 'Total de alunos registrados',
      color: 'bg-blue-100 text-blue-700 dark:bg-blue-700/20 dark:text-blue-400'
    },
    {
      title: 'Lições',
      value: data?.lessonsCount || 0,
      icon: BookOpen,
      description: 'Lições criadas',
      color: 'bg-green-100 text-green-700 dark:bg-green-700/20 dark:text-green-400'
    },
    {
      title: 'Conclusão de Tarefas',
      value: `${data?.assignmentCompletionRate || 0}%`,
      icon: ClipboardCheck,
      description: 'Taxa média de conclusão',
      color: 'bg-purple-100 text-purple-700 dark:bg-purple-700/20 dark:text-purple-400'
    },
    {
      title: 'Desempenho no Quiz',
      value: `${data?.averageQuizScore || 0}%`,
      icon: Award,
      description: 'Pontuação média no quiz',
      color: 'bg-amber-100 text-amber-700 dark:bg-amber-700/20 dark:text-amber-400'
    },
    {
      title: 'Repetição Espaçada',
      value: data?.spacedRepetitionCount || 0,
      icon: Brain,
      description: 'Itens de memória criados',
      color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-700/20 dark:text-indigo-400'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
      {analyticsCards.map((card, index) => (
        <Card key={index} className="bg-card hover:shadow-md transition-all duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium flex items-center">
              <div className={`p-2 rounded-md mr-3 ${card.color}`}>
                <card.icon className="h-5 w-5" />
              </div>
              {card.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-1">
              {isLoading ? (
                <div className="h-9 w-16 bg-muted/50 rounded animate-pulse" />
              ) : (
                card.value
              )}
            </div>
            <p className="text-sm text-muted-foreground">{card.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default AnalyticsCards;
