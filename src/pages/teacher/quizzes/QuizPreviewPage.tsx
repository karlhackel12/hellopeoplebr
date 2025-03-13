
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import TeacherLayout from '@/components/layout/TeacherLayout';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import QuizPreview from '@/components/teacher/quiz/QuizPreview';
import { Question } from '@/components/teacher/quiz/types';

const QuizPreviewPage: React.FC = () => {
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [quiz, setQuiz] = useState<any>(null);
  const [questions, setQuestions] = useState<Question[]>([]);

  useEffect(() => {
    fetchQuizData();
  }, [quizId]);

  const fetchQuizData = async () => {
    if (!quizId) return;
    
    try {
      setLoading(true);
      
      // Fetch quiz basic info
      const { data: quizData, error: quizError } = await supabase
        .from('quizzes')
        .select('*')
        .eq('id', quizId)
        .single();
      
      if (quizError) throw quizError;
      
      setQuiz(quizData);
      
      // Fetch questions
      const { data: questionData, error: questionsError } = await supabase
        .from('quiz_questions')
        .select(`
          *,
          options:quiz_question_options(*)
        `)
        .eq('quiz_id', quizId)
        .order('order_index');
      
      if (questionsError) throw questionsError;
      
      setQuestions(questionData || []);
    } catch (error) {
      console.error('Error fetching quiz data:', error);
      toast.error('Failed to load quiz data');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/teacher/quizzes');
  };

  const handleEdit = () => {
    navigate(`/teacher/quizzes/edit/${quizId}`);
  };

  if (loading) {
    return (
      <TeacherLayout>
        <div className="container mx-auto p-4 md:p-8 space-y-6">
          <div className="text-center py-8">
            <p>Loading quiz preview...</p>
          </div>
        </div>
      </TeacherLayout>
    );
  }

  if (!quiz) {
    return (
      <TeacherLayout>
        <div className="container mx-auto p-4 md:p-8 space-y-6">
          <div className="text-center py-8">
            <h2 className="text-xl font-medium mb-4">Quiz not found</h2>
            <Button onClick={handleBack}>Back to Quizzes</Button>
          </div>
        </div>
      </TeacherLayout>
    );
  }

  return (
    <TeacherLayout>
      <div className="container mx-auto p-4 md:p-8 space-y-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Quizzes
          </Button>
          <h1 className="text-2xl font-semibold">Quiz Preview</h1>
          <div className="ml-auto">
            <Button onClick={handleEdit}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Quiz
            </Button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <QuizPreview 
            questions={questions} 
            title={quiz.title}
            passPercent={quiz.pass_percent}
            isPreview={true}
          />
        </div>
      </div>
    </TeacherLayout>
  );
};

export default QuizPreviewPage;
