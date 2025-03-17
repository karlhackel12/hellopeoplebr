
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
          placeholder="Buscar tarefas ou alunos..."
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
              <SelectValue placeholder="Filtrar por status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos Status</SelectItem>
              <SelectItem value="not_started">Não Iniciada</SelectItem>
              <SelectItem value="in_progress">Em Progresso</SelectItem>
              <SelectItem value="completed">Concluída</SelectItem>
              <SelectItem value="late">Atrasada</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center gap-2">
          <BookOpenIcon className="h-4 w-4 text-muted-foreground" />
          <Select value={contentTypeFilter} onValueChange={onContentTypeFilterChange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Filtrar por tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todo Conteúdo</SelectItem>
              <SelectItem value="lesson">Lições</SelectItem>
              <SelectItem value="quiz">Quizzes</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Button
          variant="outline"
          size="icon"
          onClick={onSortOrderChange}
          title={`Ordenar por data ${sortOrder === 'asc' ? 'mais recente primeiro' : 'mais antigo primeiro'}`}
        >
          <ArrowUpDown className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default AssignmentsFilter;
