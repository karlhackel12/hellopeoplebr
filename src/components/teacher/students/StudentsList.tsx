
import React, { useState } from 'react';
import { format } from 'date-fns';
import { 
  UsersIcon,
  SearchIcon, 
  ArrowUpDown, 
  UserX 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { 
  Card,
  CardContent
} from '@/components/ui/card';
import StudentAssignmentsButton from '@/components/teacher/students/StudentAssignmentsButton';
import StudentProfileButton from '@/components/teacher/students/StudentProfileButton';
import { useIsMobile } from '@/hooks/use-mobile';

interface StudentsListProps {
  students: any[];
  loading: boolean;
  onUpdate: () => void;
}

const StudentsList: React.FC<StudentsListProps> = ({ 
  students, 
  loading, 
  onUpdate 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const isMobile = useIsMobile();

  // Filter and sort students
  const filteredStudents = students.filter(student => {
    const fullName = `${student.first_name || ''} ${student.last_name || ''}`.toLowerCase();
    return fullName.includes(searchTerm.toLowerCase());
  });

  const sortedStudents = [...filteredStudents].sort((a, b) => {
    const nameA = `${a.first_name || ''} ${a.last_name || ''}`.toLowerCase();
    const nameB = `${b.first_name || ''} ${b.last_name || ''}`.toLowerCase();
    
    if (sortOrder === 'asc') {
      return nameA.localeCompare(nameB);
    } else {
      return nameB.localeCompare(nameA);
    }
  });

  // Calculate onboarding progress
  const calculateProgress = (student: any) => {
    if (!student.user_onboarding) return 0;
    const currentStep = student.user_onboarding.current_step_index || 0;
    const totalSteps = 7; // Total steps in onboarding
    return Math.round((currentStep / totalSteps) * 100);
  };

  const handleNavigateToInvite = () => {
    // Find the tab trigger and programmatically navigate to it
    const inviteTab = document.querySelector('[data-value="invite"]') as HTMLElement;
    if (inviteTab) {
      inviteTab.click();
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center my-12">
        <p>Loading students...</p>
      </div>
    );
  }

  if (students.length === 0) {
    return (
      <Card className="bg-muted/50">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="rounded-full bg-muted p-3 mb-4">
            <UserX className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-medium mb-2">No students yet</h3>
          <p className="text-muted-foreground text-center max-w-md mb-6">
            You don't have any students yet. Use the "Invite Students" tab to send invitations.
          </p>
          <Button
            onClick={handleNavigateToInvite}
            variant="default"
          >
            Invite Students
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-64">
          <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search students..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          className="flex items-center gap-1 sm:self-start"
        >
          <span>Name</span>
          <ArrowUpDown className="h-3.5 w-3.5" />
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {sortedStudents.length === 0 ? (
          <Card className="bg-muted/50">
            <CardContent className="flex flex-col items-center justify-center py-8">
              <p className="text-muted-foreground">No matching students found</p>
            </CardContent>
          </Card>
        ) : (
          sortedStudents.map(student => (
            <Card key={student.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="flex flex-col sm:flex-row gap-4 p-4">
                  <div className="flex-shrink-0">
                    {student.avatar_url ? (
                      <img 
                        src={student.avatar_url} 
                        alt={`${student.first_name} ${student.last_name}`}
                        className="h-16 w-16 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                        <UsersIcon className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-grow space-y-2">
                    <div>
                      <h3 className="text-lg font-medium">{student.first_name} {student.last_name}</h3>
                      <p className="text-sm text-muted-foreground">
                        Joined {format(new Date(student.created_at), 'MMM d, yyyy')}
                      </p>
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-muted-foreground">Onboarding progress</span>
                        <span className="text-xs font-medium">{calculateProgress(student)}%</span>
                      </div>
                      <Progress value={calculateProgress(student)} className="h-2" />
                    </div>
                  </div>
                  
                  <div className={`flex ${isMobile ? 'flex-row justify-between' : 'items-center justify-end flex-col sm:flex-row'} gap-2 mt-4 sm:mt-0`}>
                    <StudentAssignmentsButton studentId={student.id} name={`${student.first_name} ${student.last_name}`} />
                    <StudentProfileButton studentId={student.id} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default StudentsList;
