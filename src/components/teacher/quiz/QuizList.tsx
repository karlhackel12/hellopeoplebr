
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

interface QuizListProps {
  quizzes: any[];
  loading: boolean;
  onUpdate: () => void;
  emptyMessage: string;
}

const QuizList: React.FC<QuizListProps> = ({ quizzes, loading, onUpdate, emptyMessage }) => {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="flex justify-center my-12">
        <p>Loading quizzes...</p>
      </div>
    );
  }

  if (quizzes.length === 0) {
    return (
      <div className="bg-muted p-8 rounded-lg text-center">
        <h3 className="text-xl font-medium mb-2">{emptyMessage}</h3>
        <p className="text-muted-foreground mb-4">
          Create your first quiz to help students test their knowledge.
        </p>
        <Button onClick={() => navigate('/teacher/quizzes/create')}>Create Your First Quiz</Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {quizzes.map((quiz) => (
        <QuizCard key={quiz.id} quiz={quiz} onUpdate={onUpdate} />
      ))}
    </div>
  );
};

const QuizCard: React.FC<{ quiz: any; onUpdate: () => void }> = ({ quiz, onUpdate }) => {
  const navigate = useNavigate();
  
  const handleEdit = () => {
    navigate(`/teacher/quizzes/edit/${quiz.id}`);
  };
  
  const handleDelete = async () => {
    const confirm = window.confirm('Are you sure you want to delete this quiz? This action cannot be undone.');
    
    if (confirm) {
      try {
        const { error } = await supabase.from('quizzes').delete().eq('id', quiz.id);
        
        if (error) throw error;
        
        toast.success('Quiz deleted', {
          description: 'The quiz has been successfully deleted'
        });
        
        onUpdate();
      } catch (error) {
        console.error('Error deleting quiz:', error);
        toast.error('Error', {
          description: 'Failed to delete quiz'
        });
      }
    }
  };
  
  const handleView = () => {
    navigate(`/teacher/quizzes/preview/${quiz.id}`);
  };
  
  return (
    <Card className="h-full flex flex-col glass transition-all hover:shadow-md duration-300 animate-fade-in">
      <CardHeader>
        <div className="flex justify-between items-start gap-2">
          <CardTitle className="text-gradient line-clamp-2">{quiz.title}</CardTitle>
          <Badge variant={quiz.is_published ? "default" : "outline"} className={quiz.is_published ? "bg-primary/10 shrink-0" : "shrink-0"}>
            {quiz.is_published ? "Published" : "Draft"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        {quiz.description && (
          <p className="text-sm text-muted-foreground line-clamp-3 mb-2">{quiz.description}</p>
        )}
        <p className="text-sm text-muted-foreground">
          Created {formatDistanceToNow(new Date(quiz.created_at), { addSuffix: true })}
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          Passing score: {quiz.pass_percent}%
        </p>
      </CardContent>
      <CardFooter className="flex justify-between gap-2 flex-wrap">
        <Button variant="outline" size="sm" onClick={handleView} className="hover:scale-105 transition-transform">
          <Eye className="h-4 w-4 mr-1" /> Preview
        </Button>
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

export default QuizList;
