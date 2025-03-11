
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { PlusCircle, Users, ClipboardList, Columns2, Columns3, Columns4 } from 'lucide-react';
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
  const [columns, setColumns] = useState(3);
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

  const setColumnLayout = (numColumns: number) => {
    setColumns(numColumns);
  };

  // Helper function to get the grid columns class based on current selection
  const getGridClass = () => {
    switch (columns) {
      case 2: return "grid-cols-1 sm:grid-cols-2";
      case 3: return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";
      case 4: return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4";
      default: return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";
    }
  };

  return (
    <TeacherLayout>
      <div className="animate-fade-in">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gradient">Teacher Dashboard</h1>
          <Button onClick={handleCreateLesson} className="gap-2">
            <PlusCircle className="h-4 w-4" />
            Create Lesson
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="glass hover:shadow-md transition-all duration-300 rounded-lg p-6 flex flex-col">
            <h3 className="font-semibold text-primary mb-1">Students</h3>
            <p className="text-muted-foreground mb-4 text-sm">Invite and manage your students</p>
            <p className="mt-auto">
              <Button variant="outline" className="w-full hover-scale" onClick={handleManageStudents}>
                <Users className="h-4 w-4 mr-2" />
                Manage Students
              </Button>
            </p>
          </div>
          
          <div className="glass hover:shadow-md transition-all duration-300 rounded-lg p-6 flex flex-col">
            <h3 className="font-semibold text-primary mb-1">Lessons</h3>
            <p className="text-muted-foreground mb-4 text-sm">Create and manage your teaching materials</p>
            <p className="mt-auto">
              <Button variant="outline" className="w-full hover-scale" onClick={handleCreateLesson}>
                <PlusCircle className="h-4 w-4 mr-2" />
                Create Lesson
              </Button>
            </p>
          </div>
          
          <div className="glass hover:shadow-md transition-all duration-300 rounded-lg p-6 flex flex-col">
            <h3 className="font-semibold text-primary mb-1">Assignments</h3>
            <p className="text-muted-foreground mb-4 text-sm">Assign lessons and quizzes to students</p>
            <p className="mt-auto">
              <Button variant="outline" className="w-full hover-scale" onClick={handleManageAssignments}>
                <ClipboardList className="h-4 w-4 mr-2" />
                Manage Assignments
              </Button>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap justify-between items-center mb-4 gap-2">
          <h2 className="text-2xl font-semibold">Recent Lessons</h2>
          <div className="flex items-center gap-2">
            <div className="flex bg-muted rounded-md p-1">
              <Button 
                variant={columns === 2 ? "default" : "ghost"} 
                size="sm" 
                onClick={() => setColumnLayout(2)}
                className="h-8 w-8 p-0"
              >
                <Columns2 className="h-4 w-4" />
              </Button>
              <Button 
                variant={columns === 3 ? "default" : "ghost"} 
                size="sm" 
                onClick={() => setColumnLayout(3)}
                className="h-8 w-8 p-0"
              >
                <Columns3 className="h-4 w-4" />
              </Button>
              <Button 
                variant={columns === 4 ? "default" : "ghost"} 
                size="sm" 
                onClick={() => setColumnLayout(4)}
                className="h-8 w-8 p-0"
              >
                <Columns4 className="h-4 w-4" />
              </Button>
            </div>
            <Button variant="link" onClick={handleViewAllLessons} className="story-link">View All</Button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center my-12">
            <div className="animate-pulse-light rounded-lg bg-muted h-48 w-full max-w-md"></div>
          </div>
        ) : lessons.length === 0 ? (
          <div className="glass p-8 rounded-lg text-center animate-fade-in">
            <h3 className="text-xl font-medium mb-2">No lessons created yet</h3>
            <p className="text-muted-foreground mb-4">Start creating your first lesson to help students learn.</p>
            <Button onClick={handleCreateLesson} className="hover-scale">
              <PlusCircle className="h-4 w-4 mr-2" />
              Create Your First Lesson
            </Button>
          </div>
        ) : (
          <div className={`grid ${getGridClass()} gap-6 animate-fade-in`}>
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
