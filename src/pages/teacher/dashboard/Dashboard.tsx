
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import TeacherLayout from '@/components/layout/TeacherLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, ClipboardList, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  // Fetch summary data for dashboard
  const { data: studentCount = 0 } = useQuery({
    queryKey: ['teacher-dashboard-students'],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      const { count, error } = await supabase
        .from('student_invitations')
        .select('*', { count: 'exact', head: true })
        .eq('invited_by', user.user?.id)
        .eq('status', 'accepted');
        
      if (error) throw error;
      return count || 0;
    }
  });

  const { data: quizCount = 0 } = useQuery({
    queryKey: ['teacher-dashboard-quizzes'],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      const { count, error } = await supabase
        .from('quizzes')
        .select('*', { count: 'exact', head: true })
        .eq('created_by', user.user?.id);
        
      if (error) throw error;
      return count || 0;
    }
  });

  const { data: assignmentCount = 0 } = useQuery({
    queryKey: ['teacher-dashboard-assignments'],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      const { count, error } = await supabase
        .from('student_assignments')
        .select('*', { count: 'exact', head: true })
        .eq('assigned_by', user.user?.id);
        
      if (error) throw error;
      return count || 0;
    }
  });

  return (
    <TeacherLayout>
      <div className="animate-fade-in space-y-8">
        <h1 className="text-3xl font-bold mb-6">Teacher Dashboard</h1>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{studentCount}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Students you've invited
              </p>
              <Button asChild variant="outline" className="w-full mt-4" size="sm">
                <Link to="/teacher/students">Manage Students</Link>
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Quizzes</CardTitle>
              <ClipboardList className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{quizCount}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Quizzes you've created
              </p>
              <Button asChild variant="outline" className="w-full mt-4" size="sm">
                <Link to="/teacher/quizzes">Manage Quizzes</Link>
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Active Assignments</CardTitle>
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{assignmentCount}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Assignments you've created
              </p>
              <Button asChild variant="outline" className="w-full mt-4" size="sm">
                <Link to="/teacher/assignments">Manage Assignments</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button asChild variant="outline" className="w-full">
                <Link to="/teacher/quizzes/create">Create a Quiz</Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link to="/teacher/assignments" state={{ initialTab: 'create' }}>Assign to Students</Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link to="/teacher/students?showInvite=true">Invite New Students</Link>
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Teaching Resources</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium mb-1">Quiz Creation Tips</h3>
                <p className="text-sm text-muted-foreground">Create effective quizzes to test student knowledge with multiple choice questions.</p>
              </div>
              <div>
                <h3 className="font-medium mb-1">Assignment Strategies</h3>
                <p className="text-sm text-muted-foreground">Learn how to create engaging assignments that keep students motivated.</p>
              </div>
              <div>
                <h3 className="font-medium mb-1">Student Management</h3>
                <p className="text-sm text-muted-foreground">Tips for managing your student roster and tracking progress.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </TeacherLayout>
  );
};

export default Dashboard;
