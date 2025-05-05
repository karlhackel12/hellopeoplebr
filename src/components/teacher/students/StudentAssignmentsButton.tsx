
import React from 'react';
import { Button } from '@/components/ui/button';
import { BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface StudentAssignmentsButtonProps {
  studentId: string;
  name: string;
  isVirtual?: boolean;
}

const StudentAssignmentsButton: React.FC<StudentAssignmentsButtonProps> = ({ 
  studentId, 
  name,
  isVirtual = false
}) => {
  const navigate = useNavigate();
  
  const handleClick = () => {
    // For virtual profiles, we should show a toast message
    if (isVirtual) {
      alert("O aluno precisa criar uma conta para receber atribuições");
      return;
    }
    
    navigate('/teacher/assignments', { 
      state: { 
        studentId, 
        studentName: name,
        createNew: true
      } 
    });
  };
  
  return (
    <Button
      variant={isVirtual ? "ghost" : "default"}
      size="sm"
      onClick={handleClick}
      disabled={isVirtual}
      className="flex items-center gap-1"
    >
      <BookOpen className="h-4 w-4" />
      <span className="hidden sm:inline">Atribuições</span>
    </Button>
  );
};

export default StudentAssignmentsButton;
