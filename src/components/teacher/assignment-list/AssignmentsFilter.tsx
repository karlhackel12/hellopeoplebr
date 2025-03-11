
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { FilterIcon, SearchIcon, ArrowUpDown, BookOpenIcon } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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
    <div className="flex flex-col md:flex-row gap-4">
      <div className="relative flex-1">
        <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search assignments or students..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>
      
      <div className="flex gap-2">
        <div className="flex items-center gap-2">
          <FilterIcon className="h-4 w-4 text-muted-foreground" />
          <Select value={statusFilter} onValueChange={onStatusFilterChange}>
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
          <Select value={contentTypeFilter} onValueChange={onContentTypeFilterChange}>
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
          onClick={onSortOrderChange}
          title={`Sort by date ${sortOrder === 'asc' ? 'newest first' : 'oldest first'}`}
        >
          <ArrowUpDown className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default AssignmentsFilter;
