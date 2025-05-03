import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Eye, UserPlus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { useAnalytics, ANALYTICS_EVENTS } from '@/hooks/useAnalytics';

interface LessonCardProps {
  lesson: {
    id: string;
    title: string;
    is_published: boolean;
    created_at: string;
  };
  onUpdate: () => void;
  showAssignButton?: boolean;
}

const LessonCard: React.FC<LessonCardProps> = ({ lesson, onUpdate, showAssignButton = false }) => {
  const navigate = useNavigate();
  const { trackEvent } = useAnalytics();
  
  const handleEdit = () => {
    trackEvent(ANALYTICS_EVENTS.UI.BUTTON_CLICKED, {
      button: 'edit_lesson',
      lesson_id: lesson.id,
      is_published: lesson.is_published
    });
    
    navigate(`/teacher/lessons/edit/${lesson.id}`);
  };
  
  const handleDelete = async () => {
    const confirm = window.confirm('Tem certeza de que deseja excluir esta lição? Esta ação não pode ser desfeita.');
    
    if (confirm) {
      try {
        // Track deletion attempt
        trackEvent(ANALYTICS_EVENTS.TEACHER.LESSON_DELETED, {
          lesson_id: lesson.id,
          is_published: lesson.is_published
        });
        
        const { error } = await supabase.from('lessons').delete().eq('id', lesson.id);
        
        if (error) throw error;
        
        toast.success('Lição excluída', {
          description: 'A lição foi excluída com sucesso'
        });
        
        onUpdate();
      } catch (error) {
        console.error('Error deleting lesson:', error);
        toast.error('Erro', {
          description: 'Falha ao excluir lição'
        });
      }
    }
  };
  
  const handleView = () => {
    trackEvent(ANALYTICS_EVENTS.UI.BUTTON_CLICKED, {
      button: 'preview_lesson',
      lesson_id: lesson.id,
      is_published: lesson.is_published
    });
    
    navigate(`/teacher/lessons/preview/${lesson.id}`);
  };
  
  const handleAssign = () => {
    trackEvent(ANALYTICS_EVENTS.UI.BUTTON_CLICKED, {
      button: 'assign_lesson',
      lesson_id: lesson.id,
      is_published: lesson.is_published
    });
    
    navigate('/teacher/assignments', { 
      state: { 
        initialTab: 'create',
        preSelectedLessonId: lesson.id 
      } 
    });
  };
  
  return (
    <Card className="h-full flex flex-col glass transition-all hover:shadow-md duration-300 animate-fade-in">
      <CardHeader>
        <div className="flex justify-between items-start gap-2">
          <CardTitle className="text-gradient line-clamp-2">{lesson.title}</CardTitle>
          <Badge variant={lesson.is_published ? "default" : "outline"} className={lesson.is_published ? "bg-primary/10 shrink-0" : "shrink-0"}>
            {lesson.is_published ? "Publicada" : "Rascunho"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-muted-foreground">
          Criada {formatDistanceToNow(new Date(lesson.created_at), { addSuffix: true })}
        </p>
      </CardContent>
      <CardFooter className="flex justify-between gap-2 flex-wrap">
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleView} className="hover:scale-105 transition-transform">
            <Eye className="h-4 w-4 mr-1" /> Visualizar
          </Button>
          
          {showAssignButton && lesson.is_published && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleAssign} 
              className="hover:scale-105 transition-transform"
            >
              <UserPlus className="h-4 w-4 mr-1" /> Atribuir
            </Button>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleEdit} className="hover:scale-105 transition-transform">
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={handleDelete} className="hover:scale-105 transition-transform text-destructive hover:bg-destructive hover:text-destructive-foreground">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default LessonCard;
