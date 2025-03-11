
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { PlusCircle, Users, ClipboardList } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import LessonCard from '@/components/teacher/LessonCard';
import TeacherLayout from '@/components/layout/TeacherLayout';

type Lesson = {
  id: string;
  title: string;
  is_published: boolean;
  created_at: string;
  course_id: string;
};

const TeacherDashboard: React.FC = () => {
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
        .limit(3);

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

  const handleManageStudents = () => {
    navigate('/teacher/invitations');
  };

  const handleManageAssignments = () => {
    navigate('/teacher/assignments');
  };

  const handleViewAllLessons = () => {
    navigate('/teacher/lessons');
  };

  return (
    <TeacherLayout>
      <div>
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Teacher Dashboard</h1>
          <Button onClick={handleCreateLesson} className="gap-2">
            <PlusCircle className="h-4 w-4" />
            Create Lesson
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-green-50 border border-green-100 rounded-lg p-6 flex flex-col">
            <h3 className="font-semibold text-green-800 mb-1">Students</h3>
            <p className="text-green-600 mb-4 text-sm">Invite and manage your students</p>
            <p className="mt-auto">
              <Button variant="outline" className="w-full" onClick={handleManageStudents}>
                Manage Students
              </Button>
            </p>
          </div>
          
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-6 flex flex-col">
            <h3 className="font-semibold text-blue-800 mb-1">Lessons</h3>
            <p className="text-blue-600 mb-4 text-sm">Create and manage your teaching materials</p>
            <p className="mt-auto">
              <Button variant="outline" className="w-full" onClick={handleCreateLesson}>
                Create Lesson
              </Button>
            </p>
          </div>
          
          <div className="bg-purple-50 border border-purple-100 rounded-lg p-6 flex flex-col">
            <h3 className="font-semibold text-purple-800 mb-1">Assignments</h3>
            <p className="text-purple-600 mb-4 text-sm">Assign lessons and quizzes to students</p>
            <p className="mt-auto">
              <Button variant="outline" className="w-full" onClick={handleManageAssignments}>
                Manage Assignments
              </Button>
            </p>
          </div>
        </div>

        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">Recent Lessons</h2>
          <Button variant="link" onClick={handleViewAllLessons}>View All</Button>
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {lessons.map((lesson) => (
              <LessonCard key={lesson.id} lesson={lesson} onUpdate={fetchLessons} />
            ))}
          </div>
        )}
      </div>
    </TeacherLayout>
  );
};

export default TeacherDashboard;
