
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ClipboardList, PlusCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

type Assignment = {
  id: string;
  title: string;
  status: string;
  created_at: string;
  quiz: {
    title: string;
  } | null;
};

const RecentAssignments: React.FC = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const { data: user } = await supabase.auth.getUser();
      
      if (!user.user) {
        navigate('/login');
        return;
      }

      const { data, error } = await supabase
        .from('student_assignments')
        .select('id, title, status, created_at, quiz:quiz_id(title)')
        .eq('assigned_by', user.user.id)
        .order('created_at', { ascending: false })
        .limit(6);

      if (error) throw error;
      setAssignments(data || []);
    } catch (error) {
      toast.error('Error', {
        description: 'Failed to load assignments',
      });
      console.error('Error fetching assignments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAssignment = () => {
    navigate('/teacher/assignments/create');
  };

  const handleViewAllAssignments = () => {
    navigate('/teacher/assignments');
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'in_progress':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'in_progress':
        return 'In Progress';
      default:
        return 'Not Started';
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold flex items-center">
          <ClipboardList className="h-4 w-4 mr-2" />
          Recent Assignments
        </h2>
        <Button variant="link" onClick={handleViewAllAssignments} className="story-link text-primary">
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
      ) : assignments.length === 0 ? (
        <div className="glass p-8 rounded-lg text-center animate-fade-in">
          <h3 className="text-xl font-medium mb-2">No assignments created yet</h3>
          <p className="text-muted-foreground mb-6">Start creating your first assignment to help students learn.</p>
          <Button onClick={handleCreateAssignment} className="hover:scale-105 transition-transform">
            <PlusCircle className="h-4 w-4 mr-2" />
            Create Your First Assignment
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 animate-fade-in">
          {assignments.map((assignment) => (
            <Card key={assignment.id} className="glass overflow-hidden flex flex-col h-full transition-all hover:shadow-md">
              <CardContent className="p-6 flex-grow">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-lg line-clamp-2">{assignment.title}</h3>
                  <Badge variant={getStatusBadgeVariant(assignment.status)}>
                    {getStatusLabel(assignment.status)}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Created on {format(new Date(assignment.created_at), "MMM d, yyyy")}
                </p>
                {assignment.quiz && (
                  <p className="text-sm mt-2">Quiz: {assignment.quiz.title}</p>
                )}
              </CardContent>
              <CardFooter className="px-6 py-4 bg-muted/10 flex justify-between">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => navigate(`/teacher/assignments/${assignment.id}`)}
                >
                  View
                </Button>
                <Button 
                  variant="default" 
                  size="sm" 
                  onClick={() => navigate(`/teacher/assignments/edit/${assignment.id}`)}
                >
                  Edit
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecentAssignments;
