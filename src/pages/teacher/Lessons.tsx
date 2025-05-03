import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import TeacherLayout from '@/components/layout/TeacherLayout';
import { Button } from '@/components/ui/button';
import { PlusCircle, BookOpen, Eye, Edit, Trash2, UserPlus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useIsMobile } from '@/hooks/use-mobile';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableHead, 
  TableRow, 
  TableCell 
} from '@/components/ui/table';
import { formatDistanceToNow } from 'date-fns';
import { useAnalytics, ANALYTICS_EVENTS } from '@/hooks/useAnalytics';

type Lesson = {
  id: string;
  title: string;
  is_published: boolean;
  created_at: string;
};

const Lessons: React.FC = () => {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { trackEvent } = useAnalytics();

  useEffect(() => {
    fetchLessons();
  }, []);

  const fetchLessons = async () => {
    try {
      setLoading(true);
      const { data: user } = await supabase.auth.getUser();
      
      if (!user.user) {
        navigate('/login');
        return;
      }

      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .eq('created_by', user.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLessons(data || []);
    } catch (error) {
      toast.error('Error', {
        description: 'Failed to load lessons',
      });
      console.error('Error fetching lessons:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLesson = () => {
    navigate('/teacher/lessons/create');
  };

  const handleView = (lessonId: string, isPublished: boolean) => {
    trackEvent(ANALYTICS_EVENTS.UI.BUTTON_CLICKED, {
      button: 'preview_lesson',
      lesson_id: lessonId,
      is_published: isPublished
    });
    
    navigate(`/teacher/lessons/preview/${lessonId}`);
  };
  
  const handleEdit = (lessonId: string, isPublished: boolean) => {
    trackEvent(ANALYTICS_EVENTS.UI.BUTTON_CLICKED, {
      button: 'edit_lesson',
      lesson_id: lessonId,
      is_published: isPublished
    });
    
    navigate(`/teacher/lessons/edit/${lessonId}`);
  };
  
  const handleAssign = (lessonId: string, isPublished: boolean) => {
    trackEvent(ANALYTICS_EVENTS.UI.BUTTON_CLICKED, {
      button: 'assign_lesson',
      lesson_id: lessonId,
      is_published: isPublished
    });
    
    navigate('/teacher/assignments', { 
      state: { 
        initialTab: 'create',
        preSelectedLessonId: lessonId 
      } 
    });
  };
  
  const handleDelete = async (lessonId: string, isPublished: boolean) => {
    const confirm = window.confirm('Tem certeza de que deseja excluir esta lição? Esta ação não pode ser desfeita.');
    
    if (confirm) {
      try {
        // Track deletion attempt
        trackEvent(ANALYTICS_EVENTS.TEACHER.LESSON_DELETED, {
          lesson_id: lessonId,
          is_published: isPublished
        });
        
        const { error } = await supabase.from('lessons').delete().eq('id', lessonId);
        
        if (error) throw error;
        
        toast.success('Lição excluída', {
          description: 'A lição foi excluída com sucesso'
        });
        
        fetchLessons();
      } catch (error) {
        console.error('Error deleting lesson:', error);
        toast.error('Erro', {
          description: 'Falha ao excluir lição'
        });
      }
    }
  };

  return (
    <TeacherLayout pageTitle="Minhas Lições">
      <div className="mb-8 animate-fade-in">
        <div className={`flex ${isMobile ? 'flex-col' : 'justify-between'} items-${isMobile ? 'start' : 'center'} mb-6 gap-4`}>
          {!isMobile && <h1 className="text-3xl font-bold">Minhas Lições</h1>}
          <Button onClick={handleCreateLesson} className="gap-2">
            <PlusCircle className="h-4 w-4" />
            Criar Lição
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center my-12">
            <p>Carregando lições...</p>
          </div>
        ) : lessons.length === 0 ? (
          <Card className="bg-muted/50">
            <CardContent className="flex flex-col items-center justify-center py-8">
              <div className="rounded-full bg-muted p-3 mb-4">
                <BookOpen className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-medium mb-2">Nenhuma lição criada ainda</h3>
              <p className="text-muted-foreground text-center mb-4">Comece criando sua primeira lição para ajudar os alunos a aprender.</p>
              <Button onClick={handleCreateLesson}>Criar Sua Primeira Lição</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="bg-card rounded-lg shadow-sm overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data de Criação</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lessons.map((lesson) => (
                  <TableRow key={lesson.id}>
                    <TableCell className="font-medium">{lesson.title}</TableCell>
                    <TableCell>
                      <Badge variant={lesson.is_published ? "default" : "outline"} className={lesson.is_published ? "bg-primary/10" : ""}>
                        {lesson.is_published ? "Publicada" : "Rascunho"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDistanceToNow(new Date(lesson.created_at), { addSuffix: true })}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleView(lesson.id, lesson.is_published)}
                          title="Visualizar"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        
                        {lesson.is_published && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleAssign(lesson.id, lesson.is_published)}
                            title="Atribuir"
                          >
                            <UserPlus className="h-4 w-4" />
                          </Button>
                        )}
                        
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleEdit(lesson.id, lesson.is_published)}
                          title="Editar"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleDelete(lesson.id, lesson.is_published)}
                          className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                          title="Excluir"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </TeacherLayout>
  );
};

export default Lessons;
