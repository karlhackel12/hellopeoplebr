
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import TeacherLayout from '@/components/layout/TeacherLayout';
import LessonCard from '@/components/teacher/LessonCard';
import { Button } from '@/components/ui/button';
import { PlusCircle, Columns2, Columns3, Columns4, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

type Lesson = {
  id: string;
  title: string;
  is_published: boolean;
  created_at: string;
  course_id: string;
};

const Lessons: React.FC = () => {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [filteredLessons, setFilteredLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [columns, setColumns] = useState(3);
  const [searchQuery, setSearchQuery] = useState('');
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

  useEffect(() => {
    // Filter lessons based on search query
    if (searchQuery.trim() === '') {
      setFilteredLessons(lessons);
    } else {
      const filtered = lessons.filter(lesson => 
        lesson.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredLessons(filtered);
    }
  }, [searchQuery, lessons]);

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
      setFilteredLessons(data || []);
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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gradient">My Lessons</h1>
          <Button onClick={handleCreateLesson} className="gap-2 whitespace-nowrap">
            <PlusCircle className="h-4 w-4" />
            <span className="hidden sm:inline">Create Lesson</span>
            <span className="sm:hidden">New Lesson</span>
          </Button>
        </div>

        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
          <div className="relative flex-grow max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search lessons..."
              className="pl-9 glass"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex bg-muted self-end rounded-md p-1">
            <Button 
              variant={columns === 1 ? "default" : "ghost"} 
              size="sm" 
              onClick={() => setColumnLayout(1)}
              className="h-8 w-8 p-0"
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
        </div>

        {loading ? (
          <div className={`grid ${getGridClass()} gap-4 md:gap-6`}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
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
        ) : filteredLessons.length === 0 ? (
          <div className="glass p-8 rounded-lg text-center animate-fade-in">
            {searchQuery.trim() !== '' ? (
              <>
                <h3 className="text-xl font-medium mb-2">No lessons match your search</h3>
                <p className="text-muted-foreground mb-4">Try a different search term or clear your search.</p>
                <Button variant="outline" onClick={() => setSearchQuery('')}>Clear Search</Button>
              </>
            ) : (
              <>
                <h3 className="text-xl font-medium mb-2">No lessons created yet</h3>
                <p className="text-muted-foreground mb-6">Start creating your first lesson to help students learn.</p>
                <Button onClick={handleCreateLesson} className="hover:scale-105 transition-transform">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Create Your First Lesson
                </Button>
              </>
            )}
          </div>
        ) : (
          <div className={`grid ${getGridClass()} gap-4 md:gap-6`}>
            {filteredLessons.map((lesson) => (
              <LessonCard key={lesson.id} lesson={lesson} onUpdate={fetchLessons} />
            ))}
          </div>
        )}
      </div>
    </TeacherLayout>
  );
};

export default Lessons;
