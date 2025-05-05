
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, User, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';

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
      // Obter ID do professor logado
      const { data: authData } = await supabase.auth.getUser();
      const teacherId = authData.user?.id;
      
      if (!teacherId) throw new Error("Não autenticado");
      
      // Buscar convites deste professor (tanto aceitos com user_id quanto sem)
      const { data: invitations, error: invError } = await supabase
        .from('student_invitations')
        .select('id, user_id, email, invitation_code, status, used_by_name')
        .eq('invited_by', teacherId)
        .eq('status', 'accepted');
        
      if (invError) throw invError;
      
      // Separar convites com e sem user_id
      const invitationsWithUserId = invitations
        ?.filter(invitation => invitation.user_id)
        .map(invitation => invitation.user_id) || [];
      
      const invitationsWithoutUserId = invitations
        ?.filter(invitation => !invitation.user_id) || [];
      
      let allResults: Student[] = [];
      
      // Buscar perfis dos alunos com user_id
      if (invitationsWithUserId.length > 0) {
        const { data: realProfiles, error } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, avatar_url, email')
          .in('id', invitationsWithUserId)
          .or(`first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`)
          .limit(5);
        
        if (error) throw error;
        
        if (realProfiles && realProfiles.length > 0) {
          const profilesWithVirtualFlag = realProfiles.map(profile => ({
            ...profile,
            is_virtual: false
          }));
          allResults = [...allResults, ...profilesWithVirtualFlag];
        }
      }
      
      // Adicionar "perfis virtuais" dos convites sem user_id que correspondem ao termo de busca
      const virtualProfiles = invitationsWithoutUserId
        .filter(inv => {
          const name = inv.used_by_name?.toLowerCase() || '';
          const email = inv.email?.toLowerCase() || '';
          const searchLower = searchTerm.toLowerCase();
          return name.includes(searchLower) || email.includes(searchLower);
        })
        .map(inv => ({
          id: inv.id,
          first_name: inv.used_by_name ? inv.used_by_name.split(' ')[0] : 'Aluno',
          last_name: inv.used_by_name && inv.used_by_name.split(' ').length > 1 
            ? inv.used_by_name.split(' ').slice(1).join(' ') 
            : 'Convidado',
          email: inv.email,
          is_virtual: true
        }));
      
      if (virtualProfiles.length > 0) {
        allResults = [...allResults, ...virtualProfiles];
      }
      
      setSearchResults(allResults);
    } catch (error) {
      console.error('Erro ao buscar alunos:', error);
      setSearchResults([]);
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
