
import React, { useState } from 'react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { BookOpenIcon, ClipboardListIcon, FilterIcon, SearchIcon, SortIcon, TrashIcon, UsersIcon } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface AssignmentsListProps {
  assignments: any[];
  loading: boolean;
  onUpdate: () => void;
}

const AssignmentsList: React.FC<AssignmentsListProps> = ({ 
  assignments: initialAssignments, 
  loading, 
  onUpdate 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [contentTypeFilter, setContentTypeFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Apply filters and sorting
  const filteredAssignments = initialAssignments.filter(assignment => {
    // Search by title, description, or student name
    const matchesSearch = 
      assignment.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${assignment.student?.first_name} ${assignment.student?.last_name}`.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filter by status
    const matchesStatus = statusFilter === 'all' || assignment.status === statusFilter;
    
    // Filter by content type
    const matchesContentType = 
      contentTypeFilter === 'all' || 
      (contentTypeFilter === 'lesson' && assignment.lesson_id) || 
      (contentTypeFilter === 'quiz' && assignment.quiz_id);
    
    return matchesSearch && matchesStatus && matchesContentType;
  });

  // Sort assignments
  const sortedAssignments = [...filteredAssignments].sort((a, b) => {
    const dateA = new Date(a.created_at).getTime();
    const dateB = new Date(b.created_at).getTime();
    return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
  });

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

  if (initialAssignments.length === 0) {
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
      {/* Filters and search */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search assignments or students..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        
        <div className="flex gap-2">
          <div className="flex items-center gap-2">
            <FilterIcon className="h-4 w-4 text-muted-foreground" />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="not_started">Not Started</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="late">Late</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center gap-2">
            <BookOpenIcon className="h-4 w-4 text-muted-foreground" />
            <Select value={contentTypeFilter} onValueChange={setContentTypeFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Content</SelectItem>
                <SelectItem value="lesson">Lessons</SelectItem>
                <SelectItem value="quiz">Quizzes</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Button
            variant="outline"
            size="icon"
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            title={`Sort by date ${sortOrder === 'asc' ? 'newest first' : 'oldest first'}`}
          >
            <SortIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Assignments table */}
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
              {sortedAssignments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                    No assignments match your filters. Try adjusting your search or filters.
                  </td>
                </tr>
              ) : (
                sortedAssignments.map((assignment) => (
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Summary section */}
      <div className="flex items-center justify-between bg-muted/50 p-4 rounded-lg text-sm">
        <div className="flex items-center gap-2">
          <UsersIcon className="h-4 w-4 text-muted-foreground" />
          <span>{initialAssignments.reduce((acc, curr) => {
            const studentId = curr.student?.id;
            return studentId && !acc.includes(studentId) ? [...acc, studentId] : acc;
          }, []).length} students assigned</span>
        </div>
        <div>Showing {sortedAssignments.length} of {initialAssignments.length} assignments</div>
      </div>
    </div>
  );
};

export default AssignmentsList;
