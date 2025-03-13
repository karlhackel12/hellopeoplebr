
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TeacherLayout from '@/components/layout/TeacherLayout';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { BookText, Eye, Edit, Trash2, RefreshCw, Loader2, AlertCircle } from 'lucide-react';

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
  const [error, setError] = useState<string | null>(null);
  const [retrying, setRetrying] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log("Fetching quizzes for list page...");
      
      const { data: user, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        console.error("Auth error:", authError);
        throw new Error('Authentication error: ' + authError.message);
      }
      
      if (!user.user) {
        console.log("No authenticated user found, redirecting to login");
        navigate('/login');
        return;
      }

      console.log("User authenticated, fetching quizzes list...");

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

      if (error) {
        console.error("Database error:", error);
        throw error;
      }
      
      // Transform data to include lesson title
      const formattedData = data?.map(quiz => ({
        ...quiz,
        lesson_title: quiz.lessons.title
      })) || [];

      console.log(`Successfully fetched ${formattedData.length} quizzes`);
      setQuizzes(formattedData);
      
    } catch (error: any) {
      console.error('Error fetching quizzes:', error);
      setError(error.message || 'Failed to load quizzes');
      toast.error('Error', {
        description: 'Failed to load quizzes: ' + (error.message || 'Unknown error')
      });
    } finally {
      setLoading(false);
      setRetrying(false);
    }
  };

  const handleRetry = () => {
    setRetrying(true);
    fetchQuizzes();
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
      } catch (error: any) {
        console.error('Error deleting quiz:', error);
        toast.error('Error', {
          description: 'Failed to delete quiz: ' + (error.message || 'Unknown error')
        });
      }
    }
  };

  return (
    <TeacherLayout>
      <div className="container mx-auto p-4 md:p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Quiz Management</h1>
          {error && (
            <Button 
              onClick={handleRetry} 
              variant="outline" 
              className="gap-2"
              disabled={retrying}
            >
              {retrying ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              {retrying ? 'Retrying...' : 'Retry'}
            </Button>
          )}
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center my-12 gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading quizzes...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 p-8 rounded-lg text-center border border-red-200">
            <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
            <h3 className="text-xl font-medium mb-2 text-red-700">Error Loading Quizzes</h3>
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={handleRetry} disabled={retrying}>
              {retrying ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Retrying...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </>
              )}
            </Button>
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
