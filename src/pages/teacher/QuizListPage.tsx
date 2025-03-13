
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TeacherLayout from '@/components/layout/TeacherLayout';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { BookText, Eye, Edit, Trash2 } from 'lucide-react';

interface QuizData {
  id: string;
  title: string;
  is_published: boolean;
  created_at: string;
  lesson_id: string;
  lesson_title: string;
}

const QuizListPage: React.FC = () => {
  const [quizzes, setQuizzes] = useState<QuizData[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const { data: user } = await supabase.auth.getUser();
      
      if (!user.user) {
        navigate('/login');
        return;
      }

      const { data, error } = await supabase
        .from('quizzes')
        .select(`
          *,
          lessons!inner (
            title
          )
        `)
        .eq('created_by', user.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform data to include lesson title
      const formattedData = data?.map(quiz => ({
        ...quiz,
        lesson_title: quiz.lessons.title
      })) || [];

      setQuizzes(formattedData);
    } catch (error) {
      toast.error('Error', {
        description: 'Failed to load quizzes',
      });
      console.error('Error fetching quizzes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (quizId: string, lessonId: string) => {
    navigate(`/teacher/lessons/${lessonId}/quiz`);
  };
  
  const handlePreview = (lessonId: string) => {
    navigate(`/teacher/lessons/preview/${lessonId}`);
  };
  
  const handleDelete = async (quizId: string) => {
    const confirm = window.confirm('Are you sure you want to delete this quiz? This action cannot be undone.');
    
    if (confirm) {
      try {
        // First, delete the quiz questions
        const { error: questionsError } = await supabase
          .from('quiz_questions')
          .delete()
          .eq('quiz_id', quizId);
          
        if (questionsError) throw questionsError;
        
        // Then delete the quiz itself
        const { error } = await supabase
          .from('quizzes')
          .delete()
          .eq('id', quizId);
        
        if (error) throw error;
        
        toast.success('Quiz deleted', {
          description: 'The quiz has been successfully deleted'
        });
        
        fetchQuizzes();
      } catch (error) {
        console.error('Error deleting quiz:', error);
        toast.error('Error', {
          description: 'Failed to delete quiz'
        });
      }
    }
  };

  return (
    <TeacherLayout>
      <div className="container mx-auto p-4 md:p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Quiz Management</h1>
        </div>

        {loading ? (
          <div className="flex justify-center my-12">
            <p>Loading quizzes...</p>
          </div>
        ) : quizzes.length === 0 ? (
          <div className="bg-muted p-8 rounded-lg text-center">
            <h3 className="text-xl font-medium mb-2">No quizzes created yet</h3>
            <p className="text-muted-foreground mb-4">Quizzes are created from lessons. Create a lesson first, then add a quiz.</p>
            <Button onClick={() => navigate('/teacher/lessons')}>Go to Lessons</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quizzes.map((quiz) => (
              <Card key={quiz.id} className="h-full flex flex-col animate-fade-in hover:shadow-md transition-all duration-300">
                <CardHeader>
                  <div className="flex justify-between items-start gap-2">
                    <CardTitle className="text-gradient line-clamp-2">{quiz.title}</CardTitle>
                    <Badge variant={quiz.is_published ? "default" : "outline"} className={quiz.is_published ? "bg-primary/10 shrink-0" : "shrink-0"}>
                      {quiz.is_published ? "Published" : "Draft"}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="flex-grow">
                  <div className="flex items-center text-sm text-muted-foreground mb-2">
                    <BookText className="h-4 w-4 mr-1" />
                    <span className="line-clamp-1">Lesson: {quiz.lesson_title}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Created {formatDistanceToNow(new Date(quiz.created_at), { addSuffix: true })}
                  </p>
                </CardContent>
                
                <CardFooter className="flex justify-between gap-2 flex-wrap">
                  <Button variant="outline" size="sm" onClick={() => handlePreview(quiz.lesson_id)} className="hover:scale-105 transition-transform">
                    <Eye className="h-4 w-4 mr-1" /> Preview
                  </Button>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(quiz.id, quiz.lesson_id)} className="hover:scale-105 transition-transform">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDelete(quiz.id)} className="hover:scale-105 transition-transform text-destructive hover:bg-destructive hover:text-destructive-foreground">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </TeacherLayout>
  );
};

export default QuizListPage;
