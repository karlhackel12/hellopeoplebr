
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { PlusCircle, Users, ClipboardList, Columns2, Columns3, Columns4, BookOpen } from 'lucide-react';
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
    
    // Set initial column count based on screen size
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setColumns(1);
      } else if (window.innerWidth < 1024) {
        setColumns(2);
      } else {
        setColumns(3);
      }
    };
    
    // Set initial state
    handleResize();
    
    // Add event listener
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
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
      case 1: return "grid-cols-1";
      case 2: return "grid-cols-1 sm:grid-cols-2";
      case 3: return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";
      case 4: return "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4";
      default: return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";
    }
  };

  return (
    <TeacherLayout>
      <div className="w-full animate-fade-in">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gradient">Teacher Dashboard</h1>
          <Button onClick={handleCreateLesson} className="gap-2 whitespace-nowrap">
            <PlusCircle className="h-4 w-4" />
            <span className="hidden sm:inline">Create Lesson</span>
            <span className="sm:hidden">New Lesson</span>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8">
          <div className="glass hover:shadow-md transition-all duration-300 rounded-lg p-5 flex flex-col h-full">
            <h3 className="font-semibold text-primary mb-1 flex items-center">
              <Users className="h-4 w-4 mr-2" />
              Students
            </h3>
            <p className="text-muted-foreground mb-4 text-sm">Invite and manage your students</p>
            <p className="mt-auto">
              <Button variant="outline" className="w-full hover:scale-105 transition-all" onClick={handleManageStudents}>
                Manage Students
              </Button>
            </p>
          </div>
          
          <div className="glass hover:shadow-md transition-all duration-300 rounded-lg p-5 flex flex-col h-full">
            <h3 className="font-semibold text-primary mb-1 flex items-center">
              <BookOpen className="h-4 w-4 mr-2" />
              Lessons
            </h3>
            <p className="text-muted-foreground mb-4 text-sm">Create and manage your teaching materials</p>
            <p className="mt-auto">
              <Button variant="outline" className="w-full hover:scale-105 transition-all" onClick={handleCreateLesson}>
                Create Lesson
              </Button>
            </p>
          </div>
          
          <div className="glass hover:shadow-md transition-all duration-300 rounded-lg p-5 flex flex-col h-full">
            <h3 className="font-semibold text-primary mb-1 flex items-center">
              <ClipboardList className="h-4 w-4 mr-2" />
              Assignments
            </h3>
            <p className="text-muted-foreground mb-4 text-sm">Assign lessons and quizzes to students</p>
            <p className="mt-auto">
              <Button variant="outline" className="w-full hover:scale-105 transition-all" onClick={handleManageAssignments}>
                Manage Assignments
              </Button>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap justify-between items-center mb-4 gap-2">
          <h2 className="text-xl font-semibold flex items-center">
            <BookOpen className="h-4 w-4 mr-2" />
            Recent Lessons
          </h2>
          <div className="flex items-center gap-2">
            <div className="flex bg-muted rounded-md p-1">
              <Button 
                variant={columns === 1 ? "default" : "ghost"} 
                size="sm" 
                onClick={() => setColumnLayout(1)}
                className="h-8 w-8 p-0"
                title="1 column"
              >
                <div className="w-4 h-4 flex items-center justify-center">
                  <div className="w-2 bg-current h-2"></div>
                </div>
              </Button>
              <Button 
                variant={columns === 2 ? "default" : "ghost"} 
                size="sm" 
                onClick={() => setColumnLayout(2)}
                className="h-8 w-8 p-0"
                title="2 columns"
              >
                <Columns2 className="h-4 w-4" />
              </Button>
              <Button 
                variant={columns === 3 ? "default" : "ghost"} 
                size="sm" 
                onClick={() => setColumnLayout(3)}
                className="h-8 w-8 p-0"
                title="3 columns"
              >
                <Columns3 className="h-4 w-4" />
              </Button>
              <Button 
                variant={columns === 4 ? "default" : "ghost"} 
                size="sm" 
                onClick={() => setColumnLayout(4)}
                className="h-8 w-8 p-0" 
                title="4 columns"
              >
                <Columns4 className="h-4 w-4" />
              </Button>
            </div>
            <Button variant="link" onClick={handleViewAllLessons} className="story-link text-primary">
              View All
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="grid ${getGridClass()} gap-6">
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
          <div className={`grid ${getGridClass()} gap-4 md:gap-6 animate-fade-in`}>
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
