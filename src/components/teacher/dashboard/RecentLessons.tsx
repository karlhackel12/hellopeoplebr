
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { BookOpen, PlusCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import LessonCard from '@/components/teacher/LessonCard';

type Lesson = {
  id: string;
  title: string;
  is_published: boolean;
  created_at: string;
  course_id: string;
};

const RecentLessons: React.FC = () => {
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
        .order('created_at', { ascending: false })
        .limit(6);

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

  const handleViewAllLessons = () => {
    navigate('/teacher/lessons');
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold flex items-center">
          <BookOpen className="h-4 w-4 mr-2" />
          Recent Lessons
        </h2>
        <Button variant="link" onClick={handleViewAllLessons} className="story-link text-primary">
          View All
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass animate-pulse-light rounded-lg p-6 h-[180px]">
              <div className="h-6 bg-muted/50 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-muted/50 rounded w-1/2 mb-8"></div>
              <div className="flex justify-between mt-auto">
                <div className="h-8 bg-muted/50 rounded w-24"></div>
                <div className="flex gap-2">
                  <div className="h-8 bg-muted/50 rounded w-8"></div>
                  <div className="h-8 bg-muted/50 rounded w-8"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : lessons.length === 0 ? (
        <div className="glass p-8 rounded-lg text-center animate-fade-in">
          <h3 className="text-xl font-medium mb-2">No lessons created yet</h3>
          <p className="text-muted-foreground mb-6">Start creating your first lesson to help students learn.</p>
          <Button onClick={handleCreateLesson} className="hover:scale-105 transition-transform">
            <PlusCircle className="h-4 w-4 mr-2" />
            Create Your First Lesson
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 animate-fade-in">
          {lessons.map((lesson) => (
            <LessonCard key={lesson.id} lesson={lesson} onUpdate={fetchLessons} />
          ))}
        </div>
      )}
    </div>
  );
};

export default RecentLessons;
