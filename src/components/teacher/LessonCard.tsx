
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Eye, MoreHorizontal } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';

type LessonProps = {
  lesson: {
    id: string;
    title: string;
    is_published: boolean;
    created_at: string;
  };
  onUpdate: () => void;
};

const LessonCard: React.FC<LessonProps> = ({ lesson, onUpdate }) => {
  const navigate = useNavigate();

  const handleView = () => {
    navigate(`/teacher/lessons/${lesson.id}`);
  };

  const handleEdit = () => {
    navigate(`/teacher/lessons/edit/${lesson.id}`);
  };

  const handlePublishToggle = async () => {
    try {
      const { error } = await supabase
        .from('lessons')
        .update({ is_published: !lesson.is_published })
        .eq('id', lesson.id);

      if (error) throw error;

      toast.success(lesson.is_published ? 'Lesson unpublished' : 'Lesson published');
      onUpdate();
    } catch (error) {
      console.error('Error toggling publish status:', error);
      toast.error('Failed to update lesson');
    }
  };

  const formattedDate = format(new Date(lesson.created_at), 'MMM d, yyyy');

  return (
    <Card className="glass overflow-hidden flex flex-col h-full transition-all hover:shadow-md">
      <CardContent className="p-6 flex-grow">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-lg line-clamp-2">{lesson.title}</h3>
          <Badge variant={lesson.is_published ? "success" : "outline"}>
            {lesson.is_published ? 'Published' : 'Draft'}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">Created on {formattedDate}</p>
      </CardContent>
      <CardFooter className="px-6 py-4 bg-muted/10 flex justify-between">
        <Button variant="outline" size="sm" onClick={handleView}>
          <Eye className="h-4 w-4 mr-1" />
          View
        </Button>
        <div className="flex gap-2">
          <Button variant="default" size="sm" onClick={handleEdit}>
            <Edit className="h-4 w-4 mr-1" />
            Edit
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handlePublishToggle}>
                {lesson.is_published ? 'Unpublish' : 'Publish'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardFooter>
    </Card>
  );
};

export default LessonCard;
