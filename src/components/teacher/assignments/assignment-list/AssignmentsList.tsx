
import React, { useState } from 'react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import AssignmentStatusBadge from './AssignmentStatusBadge';
import AssignmentContentType from './AssignmentContentType';
import AssignmentsEmptyState from './AssignmentsEmptyState';
import AssignmentSummary from './AssignmentSummary';

interface AssignmentsListProps {
  assignments: any[];
  loading: boolean;
  onUpdate: () => void;
}

const AssignmentsList: React.FC<AssignmentsListProps> = ({
  assignments,
  loading,
  onUpdate,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [deleting, setDeleting] = useState<string | null>(null);

  // Filter assignments based on search term
  const filteredAssignments = assignments.filter((assignment) => {
    const searchString = searchTerm.toLowerCase();
    
    // Search in title, student name, and content title
    return (
      assignment.title?.toLowerCase().includes(searchString) ||
      assignment.description?.toLowerCase().includes(searchString) ||
      `${assignment.student?.first_name} ${assignment.student?.last_name}`
        .toLowerCase()
        .includes(searchString) ||
      assignment.quiz?.title?.toLowerCase().includes(searchString)
    );
  });

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this assignment?')) {
      try {
        setDeleting(id);
        const { error } = await supabase
          .from('student_assignments')
          .delete()
          .eq('id', id);

        if (error) throw error;

        toast.success('Assignment deleted', {
          description: 'The assignment has been removed',
        });
        
        onUpdate();
      } catch (error: any) {
        console.error('Error deleting assignment:', error);
        toast.error('Failed to delete assignment', {
          description: error.message,
        });
      } finally {
        setDeleting(null);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (assignments.length === 0) {
    return <AssignmentsEmptyState />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
        <Input
          placeholder="Search assignments..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="md:max-w-xs"
        />
      </div>

      <AssignmentSummary 
        assignments={assignments} 
        filteredCount={filteredAssignments.length} 
      />

      {filteredAssignments.length === 0 ? (
        <div className="bg-muted p-8 rounded-lg text-center">
          <p className="text-muted-foreground">No assignments match your search criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredAssignments.map((assignment) => (
            <Card key={assignment.id}>
              <CardHeader className="pb-2">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2">
                  <CardTitle className="text-xl">{assignment.title}</CardTitle>
                  <AssignmentStatusBadge status={assignment.status} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium mb-1">Student</p>
                    <p className="text-sm">
                      {assignment.student
                        ? `${assignment.student.first_name} ${assignment.student.last_name}`
                        : 'Unknown student'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-1">Content</p>
                    <AssignmentContentType assignment={assignment} />
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-1">Created</p>
                    <p className="text-sm">
                      {format(new Date(assignment.created_at), 'MMM d, yyyy')}
                    </p>
                  </div>
                  {assignment.due_date && (
                    <div>
                      <p className="text-sm font-medium mb-1">Due Date</p>
                      <p className="text-sm">
                        {format(new Date(assignment.due_date), 'MMM d, yyyy')}
                      </p>
                    </div>
                  )}
                </div>

                {assignment.description && (
                  <div className="mt-4">
                    <p className="text-sm font-medium mb-1">Description</p>
                    <p className="text-sm text-muted-foreground">
                      {assignment.description}
                    </p>
                  </div>
                )}

                <div className="flex justify-end mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive"
                    onClick={() => handleDelete(assignment.id)}
                    disabled={deleting === assignment.id}
                  >
                    {deleting === assignment.id ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Trash2 className="h-4 w-4 mr-2" />
                    )}
                    Delete Assignment
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AssignmentsList;
