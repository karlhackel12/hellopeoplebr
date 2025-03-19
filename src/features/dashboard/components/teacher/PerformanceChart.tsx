import React, { useMemo, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

const PerformanceChart: React.FC = () => {
  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['student-performance-chart'],
    queryFn: async () => {
      // Get quiz attempts and voice practice in parallel
      const [quizResult, voiceResult] = await Promise.all([
        supabase
          .from('user_quiz_attempts')
          .select('quiz_id, score, user_id')
          .order('created_at', { ascending: false })
          .limit(50),
        supabase
          .from('voice_practice_feedback')
          .select('user_id, fluency_score, pronunciation_score, grammar_score')
          .order('created_at', { ascending: false })
          .limit(50)
      ]);

      const quizAttempts = quizResult.data;
      const voicePractice = voiceResult.data;
      
      // Process data for chart
      const studentPerformance = new Map();
      
      // Process quiz attempts
      quizAttempts?.forEach(attempt => {
        const studentId = attempt.user_id;
        const studentName = `Student ${studentId.slice(0, 5)}`;
        
        if (!studentPerformance.has(studentId)) {
          studentPerformance.set(studentId, {
            id: studentId, 
            name: studentName,
            quizAvg: 0,
            quizCount: 0,
            quizTotal: 0,
            fluencyAvg: 0,
            pronunciationAvg: 0,
            grammarAvg: 0,
            voiceCount: 0
          });
        }
        
        const student = studentPerformance.get(studentId);
        student.quizTotal += attempt.score;
        student.quizCount += 1;
        student.quizAvg = Math.round(student.quizTotal / student.quizCount);
      });
      
      // Process voice practice
      voicePractice?.forEach(practice => {
        const studentId = practice.user_id;
        const studentName = `Student ${studentId.slice(0, 5)}`;
        
        if (!studentPerformance.has(studentId)) {
          studentPerformance.set(studentId, {
            id: studentId,
            name: studentName,
            quizAvg: 0,
            quizCount: 0,
            quizTotal: 0,
            fluencyAvg: 0,
            pronunciationAvg: 0,
            grammarAvg: 0,
            voiceCount: 0
          });
        }
        
        const student = studentPerformance.get(studentId);
        const newVoiceCount = student.voiceCount + 1;
        
        if (practice.fluency_score) {
          student.fluencyAvg = 
            (student.fluencyAvg * student.voiceCount + Number(practice.fluency_score)) / 
            newVoiceCount;
        }
        
        if (practice.pronunciation_score) {
          student.pronunciationAvg = 
            (student.pronunciationAvg * student.voiceCount + Number(practice.pronunciation_score)) / 
            newVoiceCount;
        }
        
        if (practice.grammar_score) {
          student.grammarAvg = 
            (student.grammarAvg * student.voiceCount + Number(practice.grammar_score)) / 
            newVoiceCount;
        }
        
        student.voiceCount = newVoiceCount;
      });
      
      return Array.from(studentPerformance.values())
        .sort((a, b) => b.quizAvg - a.quizAvg)
        .slice(0, 7)
        .map(student => ({
          name: student.name,
          quizScore: student.quizAvg,
          fluency: Math.round(student.fluencyAvg * 10) / 10,
          pronunciation: Math.round(student.pronunciationAvg * 10) / 10,
          grammar: Math.round(student.grammarAvg * 10) / 10
        }));
    },
    staleTime: 60 * 1000, // Cache por 1 minuto (reduzido de 5 minutos)
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchOnReconnect: true
  });

  // Configurar subscription para atualizações em tempo real
  useEffect(() => {
    // Escutar mudanças na tabela de quiz attempts
    const quizSubscription = supabase
      .channel('quiz-attempts-changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'user_quiz_attempts' 
      }, () => {
        refetch();
      })
      .subscribe();

    // Escutar mudanças na tabela de voice practice feedback
    const voiceSubscription = supabase
      .channel('voice-feedback-changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'voice_practice_feedback' 
      }, () => {
        refetch();
      })
      .subscribe();

    return () => {
      // Limpar subscriptions
      supabase.removeChannel(quizSubscription);
      supabase.removeChannel(voiceSubscription);
    };
  }, [refetch]);

  // Recarregar dados a cada 3 minutos
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 3 * 60 * 1000); // 3 minutos

    return () => clearInterval(interval);
  }, [refetch]);

  const chartConfig = useMemo(() => ({
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
  }), []);

  const chartData = useMemo(() => data || [], [data]);

  return (
    <Card className="col-span-1 md:col-span-2 mb-8">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle>Desempenho dos Alunos</CardTitle>
          <CardDescription>
            Comparação do desempenho dos alunos em diferentes métricas
          </CardDescription>
        </div>
        <Button 
          onClick={() => refetch()} 
          variant="outline" 
          size="sm"
          disabled={isRefetching}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isRefetching ? 'animate-spin' : ''}`} />
          {isRefetching ? 'Atualizando...' : 'Atualizar'}
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading || isRefetching ? (
          <div className="w-full aspect-[2/1]">
            <Skeleton className="w-full h-full" />
          </div>
        ) : chartData.length > 0 ? (
          <div className="w-full aspect-[2/1]">
            <ChartContainer config={chartConfig}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
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

export default React.memo(PerformanceChart);
