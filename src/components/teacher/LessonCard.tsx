
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

interface LessonCardProps {
  lesson: {
    id: string;
    title: string;
    is_published: boolean;
    created_at: string;
  };
  onUpdate: () => void;
}

const LessonCard: React.FC<LessonCardProps> = ({ lesson, onUpdate }) => {
  const navigate = useNavigate();
  
  const handleEdit = () => {
    navigate(`/teacher/lessons/edit/${lesson.id}`);
  };
  
  const handleDelete = async () => {
    const confirm = window.confirm('Are you sure you want to delete this lesson? This action cannot be undone.');
    
    if (confirm) {
      try {
        const { error } = await supabase.from('lessons').delete().eq('id', lesson.id);
        
        if (error) throw error;
        
        toast('Lesson deleted', {
          description: 'The lesson has been successfully deleted'
        });
        
        onUpdate();
      } catch (error) {
        console.error('Error deleting lesson:', error);
        toast('Error', {
          description: 'Failed to delete lesson',
          variant: 'destructive'
        });
      }
    }
  };
  
  const handleView = () => {
    navigate(`/teacher/lessons/preview/${lesson.id}`);
  };
  
  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="mr-2">{lesson.title}</CardTitle>
          <Badge variant={lesson.is_published ? "default" : "outline"}>
            {lesson.is_published ? "Published" : "Draft"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-muted-foreground">
          Created {formatDistanceToNow(new Date(lesson.created_at), { addSuffix: true })}
        </p>
      </CardContent>
      <CardFooter className="flex justify-between gap-2">
        <Button variant="outline" size="sm" onClick={handleView}>
          <Eye className="h-4 w-4 mr-1" /> Preview
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleEdit}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={handleDelete} className="text-destructive hover:bg-destructive hover:text-destructive-foreground">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default LessonCard;
