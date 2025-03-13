
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Eye, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface LessonProps {
  lesson: {
    id: string;
    title: string;
    is_published: boolean;
    created_at: string;
  };
  onUpdate: () => void;
}

const LessonCard: React.FC<LessonProps> = ({ lesson, onUpdate }) => {
  const navigate = useNavigate();
  
  const handleEdit = () => {
    navigate(`/teacher/lessons/edit/${lesson.id}`);
  };
  
  const handlePreview = () => {
    navigate(`/teacher/lessons/preview/${lesson.id}`);
  };
  
  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this lesson? This action cannot be undone.')) {
      try {
        const { error } = await supabase
          .from('lessons')
          .delete()
          .eq('id', lesson.id);
          
        if (error) throw error;
        
        toast.success('Lesson deleted successfully');
        onUpdate();
      } catch (error) {
        console.error('Error deleting lesson:', error);
        toast.error('Failed to delete lesson');
      }
    }
  };
  
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <CardTitle className="text-xl">{lesson.title}</CardTitle>
          <Badge variant={lesson.is_published ? "default" : "outline"}>
            {lesson.is_published ? 'Published' : 'Draft'}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="text-sm text-muted-foreground flex-1">
        <p>Created: {format(new Date(lesson.created_at), 'MMM dd, yyyy')}</p>
      </CardContent>
      
      <CardFooter className="pt-2 border-t flex justify-between">
        <Button variant="outline" size="sm" onClick={handlePreview}>
          <Eye className="h-4 w-4 mr-1" />
          Preview
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleEdit}>
            <Edit className="h-4 w-4 mr-1" />
            Edit
          </Button>
          <Button variant="outline" size="sm" className="text-red-500 hover:text-red-700" onClick={handleDelete}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default LessonCard;
