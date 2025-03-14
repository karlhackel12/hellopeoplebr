
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import TeacherLayout from '@/components/layout/TeacherLayout';
import LessonCard from '@/components/teacher/LessonCard';
import { Button } from '@/components/ui/button';
import { PlusCircle, BookOpen } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useIsMobile } from '@/hooks/use-mobile';

type Lesson = {
  id: string;
  title: string;
  is_published: boolean;
  created_at: string;
};

const Lessons: React.FC = () => {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  useEffect(() => {
    fetchLessons();
  }, []);

  const fetchLessons = async () => {
    try {
      setLoading(true);
      const { data: user } = await supabase.auth.getUser();
      
      if (!user.user) {
        navigate('/login');
        return;
      }

      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .eq('created_by', user.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLessons(data || []);
    } catch (error) {
      toast.error('Error', {
        description: 'Failed to load lessons',
      });
      console.error('Error fetching lessons:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLesson = () => {
    navigate('/teacher/lessons/create');
  };

  return (
    <TeacherLayout pageTitle="My Lessons">
      <div className="mb-8 animate-fade-in">
        <div className={`flex ${isMobile ? 'flex-col' : 'justify-between'} items-${isMobile ? 'start' : 'center'} mb-6 gap-4`}>
          {!isMobile && <h1 className="text-3xl font-bold">My Lessons</h1>}
          <Button onClick={handleCreateLesson} className="gap-2">
            <PlusCircle className="h-4 w-4" />
            Create Lesson
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center my-12">
            <p>Loading lessons...</p>
          </div>
        ) : lessons.length === 0 ? (
          <Card className="bg-muted/50">
            <CardContent className="flex flex-col items-center justify-center py-8">
              <div className="rounded-full bg-muted p-3 mb-4">
                <BookOpen className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-medium mb-2">No lessons created yet</h3>
              <p className="text-muted-foreground text-center mb-4">Start creating your first lesson to help students learn.</p>
              <Button onClick={handleCreateLesson}>Create Your First Lesson</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {lessons.map((lesson) => (
              <LessonCard key={lesson.id} lesson={lesson} onUpdate={fetchLessons} />
            ))}
          </div>
        )}
      </div>
    </TeacherLayout>
  );
};

export default Lessons;
