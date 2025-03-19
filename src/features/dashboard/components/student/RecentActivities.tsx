import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RefreshCw, BookOpen, Mic, Clock, Calendar } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useStudentStats } from '@/pages/student/hooks/useStudentStats';
import { useRecentLessons } from '@/pages/student/hooks/useRecentLessons';
import { useVoicePractice } from '@/hooks/useVoicePractice';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { formatDuration } from '@/utils/lessonUtils';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const RecentActivities: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('lessons');
  const { recentLessons, isLoading: isLoadingLessons, refetch: refetchLessons } = useRecentLessons();
  const { sessions, isLoading: isLoadingSessions, refetch: refetchSessions } = useVoicePractice();
  const queryClient = useQueryClient();
  
  const isLoading = activeTab === 'lessons' ? isLoadingLessons : isLoadingSessions;
  
  const handleRefresh = () => {
    if (activeTab === 'lessons') {
      refetchLessons();
    } else {
      refetchSessions();
    }
  };
  
  // Configurar subscription para atualizações em tempo real
  useEffect(() => {
    const lessonProgressSubscription = supabase
      .channel('recent-lesson-progress-changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'user_lesson_progress' 
      }, () => {
        queryClient.invalidateQueries({ queryKey: ['recent-lessons'] });
      })
      .subscribe();
      
    const voiceSessionsSubscription = supabase
      .channel('recent-voice-sessions-changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'voice_practice_sessions' 
      }, () => {
        queryClient.invalidateQueries({ queryKey: ['voice-practice-sessions'] });
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(lessonProgressSubscription);
      supabase.removeChannel(voiceSessionsSubscription);
    };
  }, [queryClient]);
  
  return (
    <Card className="h-full">
      <CardHeader className="flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg">Atividades Recentes</CardTitle>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleRefresh}
          disabled={isLoading}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          {isLoading ? 'Atualizando...' : 'Atualizar'}
        </Button>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="lessons" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Lições
            </TabsTrigger>
            <TabsTrigger value="voice" className="flex items-center gap-2">
              <Mic className="h-4 w-4" />
              Conversação
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="lessons" className="space-y-4">
            {isLoadingLessons ? (
              Array(3).fill(0).map((_, i) => (
                <div key={i} className="flex items-start gap-4 p-3 rounded-lg border">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </div>
              ))
            ) : recentLessons?.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                Você ainda não completou nenhuma lição
              </div>
            ) : (
              recentLessons?.map((lesson) => (
                <div key={lesson.id} className="flex items-start gap-4 p-3 rounded-lg border hover:bg-accent/5">
                  <div className="p-2 bg-primary/10 text-primary rounded-full">
                    <BookOpen className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">{lesson.lesson?.title || 'Lição'}</h4>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {lesson.completed_at ? 
                          format(new Date(lesson.completed_at), "dd MMM yyyy", { locale: ptBR }) : 
                          'Data desconhecida'}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </TabsContent>
          
          <TabsContent value="voice" className="space-y-4">
            {isLoadingSessions ? (
              Array(3).fill(0).map((_, i) => (
                <div key={i} className="flex items-start gap-4 p-3 rounded-lg border">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </div>
              ))
            ) : sessions?.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                Você ainda não realizou sessões de prática de conversação
              </div>
            ) : (
              sessions?.slice(0, 5).map((session) => (
                <div key={session.id} className="flex items-start gap-4 p-3 rounded-lg border hover:bg-accent/5">
                  <div className="p-2 bg-red-500/10 text-red-500 rounded-full">
                    <Mic className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">{session.topic}</h4>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(session.started_at), "dd MMM yyyy", { locale: ptBR })}
                      </span>
                      {session.duration_seconds && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDuration(session.duration_seconds)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default RecentActivities; 