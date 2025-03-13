
import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

interface AssignmentsFilterProps {
  searchTerm: string;
  statusFilter: string;
  contentTypeFilter: string;
  sortOrder: 'asc' | 'desc';
  onSearchChange: (value: string) => void;
  onStatusFilterChange: (value: string) => void;
  onContentTypeFilterChange: (value: string) => void;
  onSortOrderChange: () => void;
}

const AssignmentsFilter: React.FC<AssignmentsFilterProps> = ({
  searchTerm,
  statusFilter,
  contentTypeFilter,
  sortOrder,
  onSearchChange,
  onStatusFilterChange,
  onContentTypeFilterChange,
  onSortOrderChange
}) => {
  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search assignments..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-8"
        />
      </div>
      
      <div className="flex flex-col sm:flex-row gap-2">
        <Select value={statusFilter} onValueChange={onStatusFilterChange}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="not_started">Not Started</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={contentTypeFilter} onValueChange={onContentTypeFilterChange}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="lesson">Lessons</SelectItem>
            <SelectItem value="quiz">Quizzes</SelectItem>
          </SelectContent>
        </Select>
        
        <Button 
          variant="outline" 
          className="w-full sm:w-auto"
          onClick={onSortOrderChange}
        >
          Sort: {sortOrder === 'desc' ? 'Newest First' : 'Oldest First'}
        </Button>
      </div>
    </div>
  );
};

export default AssignmentsFilter;
