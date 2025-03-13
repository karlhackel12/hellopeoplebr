
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Loader2, AlertCircle, BookOpen, Plus } from 'lucide-react';
import QuizAnalyticsCard from '../analytics/QuizAnalyticsCard';

const QuizDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const { data: quizzesData, error: quizzesError } = await supabase
          .from('quizzes')
          .select(`
            id, 
            title,
            is_published,
            created_at,
            pass_percent,
            lesson_id,
            lesson:lessons(title)
          `)
          .order('created_at', { ascending: false })
          .limit(5);
          
        if (quizzesError) throw quizzesError;
        
        setQuizzes(quizzesData || []);
      } catch (error) {
        console.error('Error fetching quizzes:', error);
        setError('Failed to load quizzes');
      } finally {
        setLoading(false);
      }
    };
    
    fetchQuizzes();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Quizzes Dashboard</h2>
          <p className="text-muted-foreground">
            View and manage all your quizzes in one place
          </p>
        </div>
        
        <Button asChild className="gap-2">
          <Link to="/teacher/lessons">
            <Plus className="h-4 w-4" />
            Create New Quiz
          </Link>
        </Button>
      </div>
      
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : error ? (
        <Card>
          <CardContent className="flex items-center gap-2 py-6">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <p className="text-sm">{error}</p>
          </CardContent>
        </Card>
      ) : quizzes.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8 text-center">
            <BookOpen className="h-8 w-8 text-muted-foreground opacity-50 mb-4" />
            <h3 className="font-medium text-lg">No quizzes yet</h3>
            <p className="text-muted-foreground mt-1 mb-4">
              Create a quiz for one of your lessons to get started
            </p>
            <Button asChild>
              <Link to="/teacher/lessons">Go to Lessons</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          <h3 className="text-lg font-medium">Recent Quizzes</h3>
          {quizzes.map((quiz) => (
            <QuizCard 
              key={quiz.id}
              id={quiz.id}
              title={quiz.title}
              lessonTitle={quiz.lesson?.title}
              lessonId={quiz.lesson_id}
              isPublished={quiz.is_published}
              passPercent={quiz.pass_percent}
            />
          ))}
          
          <div className="flex justify-center mt-2">
            <Button variant="outline" asChild>
              <Link to="/teacher/quizzes">View All Quizzes</Link>
            </Button>
          </div>
        </div>
      )}
      
      {quizzes.length > 0 && (
        <div className="pt-6">
          <h3 className="text-lg font-medium mb-4">Quiz Analytics</h3>
          <div className="space-y-6">
            <QuizAnalyticsCard 
              quizId={quizzes[0].id} 
              quizTitle={quizzes[0].title} 
            />
          </div>
        </div>
      )}
    </div>
  );
};

interface QuizCardProps {
  id: string;
  title: string;
  lessonTitle?: string;
  lessonId: string;
  isPublished: boolean;
  passPercent: number;
}

const QuizCard: React.FC<QuizCardProps> = ({ 
  id, 
  title, 
  lessonTitle, 
  lessonId, 
  isPublished, 
  passPercent 
}) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{title}</CardTitle>
            <CardDescription>
              {lessonTitle && (
                <span className="block">Lesson: {lessonTitle}</span>
              )}
              Pass mark: {passPercent}%
            </CardDescription>
          </div>
          <div className={`text-xs font-medium px-2 py-1 rounded-full ${
            isPublished 
              ? 'bg-green-50 text-green-700 border border-green-200' 
              : 'bg-amber-50 text-amber-700 border border-amber-200'
          }`}>
            {isPublished ? 'Published' : 'Draft'}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 mt-2">
          <Button size="sm" variant="outline" asChild>
            <Link to={`/teacher/lessons/edit/${lessonId}`}>
              View Lesson
            </Link>
          </Button>
          <Button size="sm" asChild>
            <Link to={`/teacher/quizzes/${id}`}>
              Manage Quiz
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuizDashboard;
