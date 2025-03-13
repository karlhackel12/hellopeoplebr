
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import TeacherLayout from '@/components/layout/TeacherLayout';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import QuizEditor from '@/components/teacher/QuizEditor';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const QuizEdit: React.FC = () => {
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [quizTitle, setQuizTitle] = useState('');
  const [lessonId, setLessonId] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuizInfo = async () => {
      if (!quizId) return;

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('quizzes')
          .select('title, lesson_id')
          .eq('id', quizId)
          .single();

        if (error) throw error;
        
        if (data) {
          setQuizTitle(data.title);
          setLessonId(data.lesson_id);
        }
      } catch (error) {
        console.error('Error fetching quiz:', error);
        toast.error('Error', {
          description: 'Failed to load quiz',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchQuizInfo();
  }, [quizId]);

  const handleBack = () => {
    if (lessonId) {
      navigate(`/teacher/lessons/quiz/${lessonId}`);
    } else {
      navigate('/teacher/quiz');
    }
  };

  return (
    <TeacherLayout>
      <div className="container mx-auto p-4 md:p-8 space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to {lessonId ? 'Lesson Quiz' : 'Quizzes'}
          </Button>
          <h1 className="text-2xl font-semibold">
            {loading ? 'Loading Quiz...' : `Edit Quiz: ${quizTitle}`}
          </h1>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <p>Loading quiz data...</p>
          </div>
        ) : (
          <QuizEditor quizId={quizId} />
        )}
      </div>
    </TeacherLayout>
  );
};

export default QuizEdit;
