
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

type Student = {
  id: string;
  first_name: string;
  last_name: string;
  avatar_url?: string;
};

const StudentSearch: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Student[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const navigate = useNavigate();
  
  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    
    setIsSearching(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, avatar_url')
        .eq('role', 'student')
        .or(`first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%`)
        .limit(5);
      
      if (error) throw error;
      setSearchResults(data || []);
    } catch (error) {
      console.error('Error searching students:', error);
    } finally {
      setIsSearching(false);
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };
  
  const viewStudentProfile = (studentId: string) => {
    navigate(`/teacher/students/${studentId}`);
  };
  
  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Encontrar Aluno</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Buscar por nome..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <Button 
            onClick={handleSearch} 
            size="icon"
            disabled={isSearching}
          >
            <Search className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="space-y-2">
          {isSearching ? (
            <div className="text-center py-2">
              <p className="text-sm text-muted-foreground">Buscando...</p>
            </div>
          ) : searchResults.length > 0 ? (
            searchResults.map((student) => (
              <div 
                key={student.id}
                className="flex items-center justify-between p-2 hover:bg-muted rounded-md cursor-pointer"
                onClick={() => viewStudentProfile(student.id)}
              >
                <div className="flex items-center gap-2">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <span>{student.first_name} {student.last_name}</span>
                </div>
                <Button variant="ghost" size="sm">Ver</Button>
              </div>
            ))
          ) : searchTerm ? (
            <div className="text-center py-2">
              <p className="text-sm text-muted-foreground">Nenhum aluno encontrado</p>
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
};

export default StudentSearch;
