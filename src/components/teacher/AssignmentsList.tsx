
import React from 'react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { BookOpenIcon, ClipboardListIcon, TrashIcon } from 'lucide-react';

interface AssignmentsListProps {
  assignments: any[];
  loading: boolean;
  onUpdate: () => void;
}

const AssignmentsList: React.FC<AssignmentsListProps> = ({ 
  assignments, 
  loading, 
  onUpdate 
}) => {
  const deleteAssignment = async (id: string) => {
    try {
      const { error } = await supabase
        .from('student_assignments')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast.success('Assignment deleted', {
        description: 'The assignment has been successfully deleted',
      });
      
      onUpdate();
    } catch (error: any) {
      console.error('Error deleting assignment:', error);
      toast.error('Failed to delete assignment', {
        description: error.message,
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'not_started':
        return <Badge variant="outline" className="bg-gray-100 border-gray-200 text-gray-800">Not Started</Badge>;
      case 'in_progress':
        return <Badge variant="outline" className="bg-blue-100 border-blue-200 text-blue-800">In Progress</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-green-100 border-green-200 text-green-800">Completed</Badge>;
      case 'late':
        return <Badge variant="outline" className="bg-red-100 border-red-200 text-red-800">Late</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getContentType = (assignment: any) => {
    if (assignment.lesson_id) {
      return (
        <div className="flex items-center">
          <BookOpenIcon className="h-4 w-4 mr-1 text-blue-500" />
          <span>Lesson: {assignment.lesson?.title || 'Unknown'}</span>
        </div>
      );
    } else if (assignment.quiz_id) {
      return (
        <div className="flex items-center">
          <ClipboardListIcon className="h-4 w-4 mr-1 text-purple-500" />
          <span>Quiz: {assignment.quiz?.title || 'Unknown'}</span>
        </div>
      );
    }
    return <span>Unknown content</span>;
  };

  if (loading) {
    return (
      <div className="flex justify-center my-12">
        <p>Loading assignments...</p>
      </div>
    );
  }

  if (assignments.length === 0) {
    return (
      <div className="bg-muted p-8 rounded-lg text-center">
        <ClipboardListIcon className="mx-auto h-10 w-10 text-muted-foreground mb-4" />
        <h3 className="text-xl font-medium mb-2">No assignments created</h3>
        <p className="text-muted-foreground mb-4">When you create assignments for students, they will appear here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-card rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left">Assignment</th>
                <th className="px-4 py-3 text-left">Student</th>
                <th className="px-4 py-3 text-left">Content</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Due Date</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {assignments.map((assignment) => (
                <tr key={assignment.id}>
                  <td className="px-4 py-3">
                    <div>
                      <div className="font-medium">{assignment.title}</div>
                      {assignment.description && (
                        <div className="text-sm text-muted-foreground truncate max-w-[200px]">
                          {assignment.description}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {assignment.student ? (
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
                          {assignment.student.first_name?.[0]}{assignment.student.last_name?.[0]}
                        </div>
                        <span>
                          {assignment.student.first_name} {assignment.student.last_name}
                        </span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">Unknown student</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {getContentType(assignment)}
                  </td>
                  <td className="px-4 py-3">
                    {getStatusBadge(assignment.status)}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {assignment.due_date 
                      ? format(new Date(assignment.due_date), 'MMM dd, yyyy')
                      : 'No due date'
                    }
                  </td>
                  <td className="px-4 py-3 text-right">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Delete assignment"
                        >
                          <TrashIcon className="h-4 w-4 text-red-500" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Assignment</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete this assignment. This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => deleteAssignment(assignment.id)}
                            className="bg-red-500 text-white hover:bg-red-600"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AssignmentsList;
