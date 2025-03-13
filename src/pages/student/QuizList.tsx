
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StudentLayout from '@/components/layout/StudentLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, FileText, ArrowRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const StudentQuizList: React.FC = () => {
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [attempts, setAttempts] = useState<any[]>([]);
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

      // Fetch published quizzes
      const { data: quizData, error: quizError } = await supabase
        .from('quizzes')
        .select(`
          id,
          title,
          description,
          pass_percent,
          created_at
        `)
        .eq('is_published', true)
        .order('created_at', { ascending: false });

      if (quizError) throw quizError;
      
      // Fetch user's quiz attempts
      const { data: attemptData, error: attemptError } = await supabase
        .from('user_quiz_attempts')
        .select(`
          id,
          quiz_id,
          score,
          passed,
          completed_at
        `)
        .eq('user_id', user.user.id);

      if (attemptError) throw attemptError;
      
      setQuizzes(quizData || []);
      setAttempts(attemptData || []);
    } catch (error) {
      console.error('Error fetching quizzes:', error);
      toast.error('Failed to load quizzes');
    } finally {
      setLoading(false);
    }
  };

  // Helper to get a user's best score for a specific quiz
  const getBestAttempt = (quizId: string) => {
    const quizAttempts = attempts.filter(a => a.quiz_id === quizId);
    if (quizAttempts.length === 0) return null;
    
    return quizAttempts.reduce((best, current) => {
      if (!best) return current;
      return current.score > best.score ? current : best;
    }, null);
  };

  // Helper to determine if a quiz has been passed
  const hasPassedQuiz = (quizId: string) => {
    return attempts.some(a => a.quiz_id === quizId && a.passed);
  };

  // Helper to determine if a quiz has been attempted
  const hasAttemptedQuiz = (quizId: string) => {
    return attempts.some(a => a.quiz_id === quizId);
  };

  return (
    <StudentLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Quizzes</h1>
          <p className="text-muted-foreground">Take quizzes to test your knowledge</p>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <p>Loading quizzes...</p>
          </div>
        ) : quizzes.length === 0 ? (
          <Card>
            <CardContent className="pt-6 pb-6 text-center">
              <p className="text-muted-foreground">No quizzes available at the moment</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {quizzes.map((quiz) => {
              const bestAttempt = getBestAttempt(quiz.id);
              const isPassed = hasPassedQuiz(quiz.id);
              const isAttempted = hasAttemptedQuiz(quiz.id);
              
              return (
                <Card key={quiz.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{quiz.title}</CardTitle>
                        <CardDescription>
                          Pass score: {quiz.pass_percent}%
                        </CardDescription>
                      </div>
                      {isPassed ? (
                        <Badge className="bg-green-100 text-green-800 border-green-200">
                          Passed
                        </Badge>
                      ) : isAttempted ? (
                        <Badge variant="outline">
                          In Progress
                        </Badge>
                      ) : null}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {quiz.description && (
                      <p className="text-sm text-muted-foreground mb-4">{quiz.description}</p>
                    )}
                    
                    {bestAttempt && (
                      <div className="flex items-center justify-between mb-4 p-3 bg-muted rounded-md">
                        <div>
                          <p className="text-sm font-medium">Best Score</p>
                          <p className="text-2xl font-bold">{bestAttempt.score}%</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">
                            {isPassed ? 'Passed' : 'Not passed yet'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {bestAttempt.completed_at ? new Date(bestAttempt.completed_at).toLocaleDateString() : 'In progress'}
                          </p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter>
                    <Button onClick={() => navigate(`/student/quizzes/take/${quiz.id}`)} className="w-full">
                      {isPassed ? 'Retake Quiz' : isAttempted ? 'Continue Quiz' : 'Start Quiz'}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </StudentLayout>
  );
};

export default StudentQuizList;
