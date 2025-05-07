
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, User, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

type Student = {
  id: string;
  first_name: string;
  last_name: string;
  avatar_url?: string;
  email?: string;
  is_virtual?: boolean;
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
      // Get logged in teacher ID
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError || !authData.user) {
        toast.error("Authentication error", { description: "Please log in again" });
        throw new Error("Not authenticated");
      }
      
      const teacherId = authData.user.id;
      
      // Get invitations from this teacher (both accepted with user_id and without)
      const { data: invitations, error: invError } = await supabase
        .from('student_invitations')
        .select('id, user_id, email, invitation_code, status, used_by_name')
        .eq('invited_by', teacherId)
        .eq('status', 'accepted');
        
      if (invError) throw invError;
      
      // Get all student profiles, but don't rely on email field yet
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, avatar_url')
        .eq('role', 'student');
        
      if (profilesError) throw profilesError;
      
      const allStudentProfiles = profilesData || [];
      
      let allResults: Student[] = [];
      
      // Process invitations and find matching profiles
      if (invitations && invitations.length > 0) {
        for (const invitation of invitations) {
          // Try to match by user_id first
          let matchingProfile = allStudentProfiles.find(p => p.id === invitation.user_id);
          
          if (matchingProfile) {
            // We have a real profile that matches this invitation
            const student: Student = {
              id: matchingProfile.id,
              first_name: matchingProfile.first_name,
              last_name: matchingProfile.last_name,
              avatar_url: matchingProfile.avatar_url,
              email: invitation.email, // Use email from invitation instead of profile
              is_virtual: false
            };
            
            // Check if this student matches the search term
            const fullName = `${student.first_name} ${student.last_name}`.toLowerCase();
            const email = student.email?.toLowerCase() || '';
            const searchLower = searchTerm.toLowerCase();
            
            if (fullName.includes(searchLower) || email.includes(searchLower)) {
              allResults.push(student);
            }
          } else {
            // No match, create a virtual profile
            const virtualStudent: Student = {
              id: invitation.id,
              first_name: invitation.used_by_name ? invitation.used_by_name.split(' ')[0] : 'Aluno',
              last_name: invitation.used_by_name && invitation.used_by_name.split(' ').length > 1 
                ? invitation.used_by_name.split(' ').slice(1).join(' ') 
                : 'Convidado',
              email: invitation.email,
              is_virtual: true
            };
            
            // Check if this virtual student matches the search term
            const fullName = `${virtualStudent.first_name} ${virtualStudent.last_name}`.toLowerCase();
            const email = virtualStudent.email?.toLowerCase() || '';
            const searchLower = searchTerm.toLowerCase();
            
            if (fullName.includes(searchLower) || email.includes(searchLower)) {
              allResults.push(virtualStudent);
            }
          }
        }
      }
      
      setSearchResults(allResults);
    } catch (error) {
      console.error('Error searching students:', error);
      setSearchResults([]);
      toast.error('Failed to search students', {
        description: error instanceof Error ? error.message : 'An unexpected error occurred'
      });
    } finally {
      setIsSearching(false);
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };
  
  const viewStudentProfile = (studentId: string, isVirtual: boolean = false) => {
    navigate(`/teacher/students/profile/${studentId}${isVirtual ? '?virtual=true' : ''}`);
  };
  
  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Encontrar Aluno</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Buscar por nome ou email..."
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
                onClick={() => viewStudentProfile(student.id, student.is_virtual)}
              >
                <div className="flex items-center gap-2">
                  <div className="bg-primary/10 p-2 rounded-full">
                    {student.is_virtual ? (
                      <Mail className="h-4 w-4 text-primary" />
                    ) : (
                      <User className="h-4 w-4 text-primary" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span>{student.first_name} {student.last_name}</span>
                      {student.is_virtual && (
                        <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700 border-yellow-200">
                          Pendente
                        </Badge>
                      )}
                    </div>
                    {student.email && (
                      <span className="text-xs text-muted-foreground">{student.email}</span>
                    )}
                  </div>
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
