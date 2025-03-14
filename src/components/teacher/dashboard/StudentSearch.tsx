
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, User, X } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

interface Student {
  id: string;
  first_name: string;
  last_name: string;
  avatar_url: string;
  created_at: string;
}

const StudentSearch: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const { data: students = [], isLoading } = useQuery({
    queryKey: ['student-search', searchTerm],
    queryFn: async () => {
      const query = supabase
        .from('profiles')
        .select('id, first_name, last_name, avatar_url, created_at')
        .eq('role', 'student')
        .order('created_at', { ascending: false });
      
      if (searchTerm) {
        query.or(`first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%`);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data || [];
    },
    enabled: true,
  });

  const handleClearSearch = () => {
    setSearchTerm('');
  };

  const handleViewStudent = (studentId: string) => {
    navigate(`/teacher/students/profile/${studentId}`);
  };

  return (
    <div className="bg-card p-4 rounded-lg shadow-sm mb-6">
      <h2 className="text-lg font-semibold mb-3">Find Student</h2>
      
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search students by name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9 pr-9"
        />
        {searchTerm && (
          <button 
            className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground hover:text-foreground"
            onClick={handleClearSearch}
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      
      <div className="space-y-3 max-h-[300px] overflow-y-auto">
        {isLoading ? (
          Array(3).fill(0).map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-2">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-1 flex-1">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-3 w-1/4" />
              </div>
            </div>
          ))
        ) : students.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            {searchTerm ? 'No students found matching your search' : 'No students found'}
          </div>
        ) : (
          students.map((student) => (
            <div key={student.id} className="flex items-center gap-3 p-2 rounded-md hover:bg-muted transition-colors cursor-pointer" onClick={() => handleViewStudent(student.id)}>
              {student.avatar_url ? (
                <img src={student.avatar_url} alt={`${student.first_name} ${student.last_name}`} className="h-10 w-10 rounded-full object-cover" />
              ) : (
                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                  <User className="h-5 w-5 text-muted-foreground" />
                </div>
              )}
              <div>
                <p className="font-medium">{student.first_name} {student.last_name}</p>
                <p className="text-xs text-muted-foreground">
                  Joined {format(new Date(student.created_at), 'MMMM d, yyyy')}
                </p>
              </div>
              <Button variant="ghost" size="sm" className="ml-auto">
                View Profile
              </Button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default StudentSearch;
