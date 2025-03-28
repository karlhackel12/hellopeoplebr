
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { BookOpen, PlusCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import LessonCard from '@/components/teacher/LessonCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAnalytics, ANALYTICS_EVENTS } from '@/hooks/useAnalytics';

type Lesson = {
  id: string;
  title: string;
  is_published: boolean;
  created_at: string;
};

const RecentLessons: React.FC = () => {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { trackEvent } = useAnalytics();

  useEffect(() => {
    fetchLessons();
  }, []);

  const fetchLessons = async () => {
    try {
      setLoading(true);
      const {
        data: user
      } = await supabase.auth.getUser();
      if (!user.user) {
        navigate('/login');
        return;
      }
      const {
        data,
        error
      } = await supabase.from('lessons').select('*').eq('created_by', user.user.id).order('created_at', {
        ascending: false
      }).limit(6);
      if (error) throw error;
      
      setLessons(data || []);
      
      // Track lessons loaded
      trackEvent(ANALYTICS_EVENTS.UI.NAVIGATION, {
        component: 'recent_lessons',
        lessons_count: data?.length || 0
      });
    } catch (error) {
      toast.error('Erro', {
        description: 'Falha ao carregar lições'
      });
      console.error('Error fetching lessons:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLesson = () => {
    trackEvent(ANALYTICS_EVENTS.UI.BUTTON_CLICKED, {
      button: 'create_lesson',
      location: 'recent_lessons'
    });
    
    navigate('/teacher/lessons/create');
  };

  const handleViewAllLessons = () => {
    trackEvent(ANALYTICS_EVENTS.UI.BUTTON_CLICKED, {
      button: 'view_all_lessons',
      location: 'dashboard'
    });
    
    navigate('/teacher/lessons');
  };

  return (
    <div className="mt-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Lições Recentes</h2>
        <Button variant="outline" size="sm" onClick={handleViewAllLessons}>
          Ver Todas as Lições
        </Button>
      </div>

      {loading ? (
        <div className="py-4 text-center">
          <p className="text-muted-foreground">Carregando lições...</p>
        </div>
      ) : lessons.length === 0 ? (
        <Card className="bg-muted/50">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <div className="rounded-full bg-muted p-3 mb-4">
              <BookOpen className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2">Nenhuma lição criada ainda</h3>
            <p className="text-muted-foreground text-center max-w-md mb-6">
              Crie sua primeira lição para seus alunos.
            </p>
            <Button
              onClick={handleCreateLesson}
              className="gap-2"
            >
              <PlusCircle className="h-4 w-4" />
              Criar Primeira Lição
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {lessons.map((lesson) => (
            <LessonCard key={lesson.id} lesson={lesson} onUpdate={fetchLessons} />
          ))}
        </div>
      )}
    </div>
  );
};

export default RecentLessons;
