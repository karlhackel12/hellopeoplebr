
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

const PerformanceChart: React.FC = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['student-performance-chart'],
    queryFn: async () => {
      // Get quiz attempts
      const { data: quizAttempts } = await supabase
        .from('user_quiz_attempts')
        .select('quiz_id, score, user_id')
        .order('created_at', { ascending: false })
        .limit(50);
      
      // Get voice practice analytics
      const { data: voicePractice } = await supabase
        .from('voice_practice_feedback')
        .select('user_id, fluency_score, pronunciation_score, grammar_score')
        .order('created_at', { ascending: false })
        .limit(50);
      
      // Process data for chart
      const studentPerformance: Record<string, any> = {};
      
      quizAttempts?.forEach(attempt => {
        const studentId = attempt.user_id;
        // Use student ID as name since we can't access profiles data
        const studentName = `Aluno ${studentId.slice(0, 5)}`;
        
        if (!studentPerformance[studentId]) {
          studentPerformance[studentId] = {
            id: studentId, 
            name: studentName,
            quizAvg: 0,
            quizCount: 0,
            quizTotal: 0,
            fluencyAvg: 0,
            pronunciationAvg: 0,
            grammarAvg: 0,
            voiceCount: 0
          };
        }
        
        studentPerformance[studentId].quizTotal += attempt.score;
        studentPerformance[studentId].quizCount += 1;
        studentPerformance[studentId].quizAvg = Math.round(
          studentPerformance[studentId].quizTotal / studentPerformance[studentId].quizCount
        );
      });
      
      voicePractice?.forEach(practice => {
        const studentId = practice.user_id;
        // Use student ID as name since we can't access profiles data
        const studentName = `Aluno ${studentId.slice(0, 5)}`;
        
        if (!studentPerformance[studentId]) {
          studentPerformance[studentId] = {
            id: studentId,
            name: studentName,
            quizAvg: 0,
            quizCount: 0,
            quizTotal: 0,
            fluencyAvg: 0,
            pronunciationAvg: 0,
            grammarAvg: 0,
            voiceCount: 0
          };
        }
        
        if (practice.fluency_score) {
          studentPerformance[studentId].fluencyAvg = 
            (studentPerformance[studentId].fluencyAvg * studentPerformance[studentId].voiceCount + Number(practice.fluency_score)) / 
            (studentPerformance[studentId].voiceCount + 1);
        }
        
        if (practice.pronunciation_score) {
          studentPerformance[studentId].pronunciationAvg = 
            (studentPerformance[studentId].pronunciationAvg * studentPerformance[studentId].voiceCount + Number(practice.pronunciation_score)) / 
            (studentPerformance[studentId].voiceCount + 1);
        }
        
        if (practice.grammar_score) {
          studentPerformance[studentId].grammarAvg = 
            (studentPerformance[studentId].grammarAvg * studentPerformance[studentId].voiceCount + Number(practice.grammar_score)) / 
            (studentPerformance[studentId].voiceCount + 1);
        }
        
        studentPerformance[studentId].voiceCount += 1;
      });
      
      // Convert to array and take top students by quiz performance
      return Object.values(studentPerformance)
        .sort((a: any, b: any) => b.quizAvg - a.quizAvg)
        .slice(0, 7)
        .map((student: any) => ({
          name: student.name,
          quizScore: student.quizAvg,
          fluency: Math.round(student.fluencyAvg * 10) / 10,
          pronunciation: Math.round(student.pronunciationAvg * 10) / 10,
          grammar: Math.round(student.grammarAvg * 10) / 10
        }));
    }
  });

  const chartConfig = {
    quizScore: { 
      label: "Pontuação Quiz",
      color: "#4f46e5"
    },
    fluency: { 
      label: "Fluência",
      color: "#06b6d4"
    },
    pronunciation: { 
      label: "Pronúncia",
      color: "#10b981"
    },
    grammar: { 
      label: "Gramática",
      color: "#f59e0b"
    }
  };

  return (
    <Card className="col-span-1 md:col-span-2 mb-8">
      <CardHeader>
        <CardTitle>Desempenho dos Alunos</CardTitle>
        <CardDescription>
          Comparação do desempenho dos alunos em diferentes métricas
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="w-full aspect-[2/1]">
            <Skeleton className="w-full h-full" />
          </div>
        ) : data && data.length > 0 ? (
          <div className="w-full aspect-[2/1]">
            <ChartContainer config={chartConfig}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 60,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    angle={-45} 
                    textAnchor="end"
                    tick={{ fontSize: 12 }}
                    height={60}
                  />
                  <YAxis />
                  <ChartTooltip
                    content={<ChartTooltipContent nameKey="name" />}
                  />
                  <Legend />
                  <Bar dataKey="quizScore" fill="#4f46e5" />
                  <Bar dataKey="fluency" fill="#06b6d4" />
                  <Bar dataKey="pronunciation" fill="#10b981" />
                  <Bar dataKey="grammar" fill="#f59e0b" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            Nenhum dado de desempenho disponível ainda
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PerformanceChart;
