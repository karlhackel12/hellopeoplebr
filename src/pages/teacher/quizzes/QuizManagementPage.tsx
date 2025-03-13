
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TeacherLayout from '@/components/layout/TeacherLayout';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import QuizList from '@/components/teacher/quiz/QuizList';

const QuizManagementPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const navigate = useNavigate();

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
          id,
          title,
          description,
          is_published,
          pass_percent,
          created_at,
          lesson_id
        `)
        .eq('created_by', user.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setQuizzes(data || []);
    } catch (error) {
      console.error('Error fetching quizzes:', error);
      toast.error('Failed to load quizzes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, [navigate]);

  const handleCreateQuiz = () => {
    navigate('/teacher/quizzes/create');
  };

  return (
    <TeacherLayout>
      <div className="container mx-auto p-4 md:p-8 space-y-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Quiz Management</h1>
          <Button onClick={handleCreateQuiz} className="gap-2">
            <PlusCircle className="h-4 w-4" />
            Create Quiz
          </Button>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList>
            <TabsTrigger value="all">All Quizzes</TabsTrigger>
            <TabsTrigger value="published">Published</TabsTrigger>
            <TabsTrigger value="drafts">Drafts</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="mt-6">
            <QuizList 
              quizzes={quizzes} 
              loading={loading} 
              onUpdate={fetchQuizzes} 
              emptyMessage="No quizzes found" 
            />
          </TabsContent>
          
          <TabsContent value="published" className="mt-6">
            <QuizList 
              quizzes={quizzes.filter(quiz => quiz.is_published)} 
              loading={loading} 
              onUpdate={fetchQuizzes} 
              emptyMessage="No published quizzes" 
            />
          </TabsContent>
          
          <TabsContent value="drafts" className="mt-6">
            <QuizList 
              quizzes={quizzes.filter(quiz => !quiz.is_published)} 
              loading={loading} 
              onUpdate={fetchQuizzes} 
              emptyMessage="No draft quizzes" 
            />
          </TabsContent>
        </Tabs>
      </div>
    </TeacherLayout>
  );
};

export default QuizManagementPage;
