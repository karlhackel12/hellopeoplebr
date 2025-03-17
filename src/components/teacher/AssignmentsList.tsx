
import React, { useState } from 'react';
import AssignmentsFilter from './assignment-list/AssignmentsFilter';
import AssignmentsTable from './assignment-list/AssignmentsTable';
import AssignmentsEmptyState from './assignment-list/AssignmentsEmptyState';
import AssignmentSummary from './assignment-list/AssignmentSummary';

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

  const filteredAssignments = initialAssignments.filter(assignment => {
    const matchesSearch = 
      assignment.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${assignment.student?.first_name} ${assignment.student?.last_name}`.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || assignment.status === statusFilter;
    
    const matchesContentType = 
      contentTypeFilter === 'all' || 
      (contentTypeFilter === 'lesson' && assignment.lesson_id) || 
      (contentTypeFilter === 'quiz' && assignment.quiz_id);
    
    return matchesSearch && matchesStatus && matchesContentType;
  });

  const sortedAssignments = [...filteredAssignments].sort((a, b) => {
    const dateA = new Date(a.created_at).getTime();
    const dateB = new Date(b.created_at).getTime();
    return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
  });

  if (loading) {
    return (
      <div className="flex justify-center my-12">
        <p>Carregando tarefas...</p>
      </div>
    );
  }

  if (initialAssignments.length === 0) {
    return <AssignmentsEmptyState />;
  }

  return (
    <div className="space-y-4">
      <AssignmentsFilter
        searchTerm={searchTerm}
        statusFilter={statusFilter}
        contentTypeFilter={contentTypeFilter}
        sortOrder={sortOrder}
        onSearchChange={setSearchTerm}
        onStatusFilterChange={setStatusFilter}
        onContentTypeFilterChange={setContentTypeFilter}
        onSortOrderChange={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
      />
      
      <AssignmentsTable 
        assignments={sortedAssignments} 
        onUpdate={onUpdate} 
      />
      
      <AssignmentSummary 
        assignments={initialAssignments}
        filteredCount={sortedAssignments.length}
      />
    </div>
  );
};

export default AssignmentsList;
