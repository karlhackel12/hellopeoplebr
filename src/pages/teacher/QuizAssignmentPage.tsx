
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TeacherLayout from '@/components/layout/TeacherLayout';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { PlusCircle, BookText, ClipboardCheck } from 'lucide-react';
import AssignmentForm from '@/components/teacher/AssignmentForm';

const QuizAssignmentPage: React.FC = () => {
  const [students, setStudents] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [activeTab, setActiveTab] = useState('assign');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data: user } = await supabase.auth.getUser();
      
      if (!user.user) {
        navigate('/login');
        return;
      }

      // Fetch students
      const { data: studentsData, error: studentsError } = await supabase
        .from('student_invitations')
        .select('id, email, status, user_id, used_by_name')
        .eq('invited_by', user.user.id)
        .eq('status', 'accepted');
      
      if (studentsError) throw studentsError;

      // Fetch published lessons
      const { data: lessonsData, error: lessonsError } = await supabase
        .from('lessons')
        .select('id, title, is_published')
        .eq('created_by', user.user.id)
        .eq('is_published', true)
        .order('created_at', { ascending: false });
      
      if (lessonsError) throw lessonsError;

      // Fetch published quizzes
      const { data: quizzesData, error: quizzesError } = await supabase
        .from('quizzes')
        .select('id, title, lesson_id, is_published')
        .eq('created_by', user.user.id)
        .eq('is_published', true)
        .order('created_at', { ascending: false });
      
      if (quizzesError) throw quizzesError;

      setStudents(studentsData || []);
      setLessons(lessonsData || []);
      setQuizzes(quizzesData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  return (
    <TeacherLayout>
      <div className="container mx-auto p-4 md:p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Quiz Assignments</h1>
          <Button onClick={() => navigate('/teacher/quizzes')} className="flex items-center gap-2">
            <BookText className="h-4 w-4" />
            Manage Quizzes
          </Button>
        </div>

        <Tabs defaultValue="assign" value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="grid w-full md:w-auto md:inline-grid grid-cols-2">
            <TabsTrigger value="assign" className="flex items-center gap-2">
              <PlusCircle className="h-4 w-4" />
              Assign Quiz
            </TabsTrigger>
            <TabsTrigger value="view" className="flex items-center gap-2">
              <ClipboardCheck className="h-4 w-4" />
              View Assignments
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="assign" className="py-4">
            <Card>
              <CardHeader>
                <CardTitle>Create New Quiz Assignment</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <p>Loading...</p>
                ) : (
                  <>
                    {students.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="mb-4">You need to invite and have active students before you can assign quizzes.</p>
                        <Button onClick={() => navigate('/teacher/invitations')}>
                          Invite Students
                        </Button>
                      </div>
                    ) : quizzes.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="mb-4">You need to create and publish quizzes before you can assign them.</p>
                        <Button onClick={() => navigate('/teacher/lessons')}>
                          Create Lessons & Quizzes
                        </Button>
                      </div>
                    ) : (
                      <AssignmentForm 
                        students={students} 
                        lessons={lessons}
                        quizzes={quizzes}
                        onSuccess={fetchData}
                        isLoading={loading}
                      />
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="view" className="py-4">
            <Card>
              <CardHeader>
                <CardTitle>Quiz Assignments</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <p>Loading assignments...</p>
                ) : (
                  <div className="text-center py-10">
                    <p className="mb-4">Quiz assignment history will be displayed here.</p>
                    <Button onClick={() => setActiveTab('assign')}>
                      Create New Assignment
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </TeacherLayout>
  );
};

export default QuizAssignmentPage;
