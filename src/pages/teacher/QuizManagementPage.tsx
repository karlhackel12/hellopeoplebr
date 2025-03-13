
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import TeacherLayout from '@/components/layout/TeacherLayout';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, ArrowLeft, BookText } from 'lucide-react';
import QuizTab from '@/components/teacher/lesson/quiz/QuizTab';

const QuizManagementPage = () => {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const [lessonTitle, setLessonTitle] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLessonDetails = async () => {
      if (!lessonId) return;
      
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('lessons')
          .select('title')
          .eq('id', lessonId)
          .single();
        
        if (error) throw error;
        
        if (data) {
          setLessonTitle(data.title);
        }
      } catch (error) {
        console.error('Error fetching lesson details:', error);
        toast.error('Failed to load lesson details');
      } finally {
        setLoading(false);
      }
    };
    
    fetchLessonDetails();
  }, [lessonId]);

  const handleBack = () => {
    navigate(`/teacher/lessons/edit/${lessonId}`);
  };

  return (
    <TeacherLayout>
      <div className="container mx-auto p-4 md:p-8 space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={handleBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Lesson
            </Button>
            
            {loading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Loading...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <BookText className="h-5 w-5 text-muted-foreground" />
                <h1 className="text-2xl font-semibold">
                  Quiz for: <span className="text-primary">{lessonTitle}</span>
                </h1>
              </div>
            )}
          </div>
        </div>

        <QuizTab lessonId={lessonId} isEditMode={true} />
      </div>
    </TeacherLayout>
  );
};

export default QuizManagementPage;
