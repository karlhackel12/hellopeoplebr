
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import TeacherLayout from '@/components/layout/TeacherLayout';
import LessonCard from '@/components/teacher/lessons/LessonCard';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';

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
    <TeacherLayout>
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">My Lessons</h1>
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
          <div className="bg-muted p-8 rounded-lg text-center">
            <h3 className="text-xl font-medium mb-2">No lessons created yet</h3>
            <p className="text-muted-foreground mb-4">Start creating your first lesson to help students learn.</p>
            <Button onClick={handleCreateLesson}>Create Your First Lesson</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
