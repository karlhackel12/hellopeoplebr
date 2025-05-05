
import React from 'react';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface StudentProfileButtonProps {
  studentId: string;
  isVirtual?: boolean;
}

const StudentProfileButton: React.FC<StudentProfileButtonProps> = ({ 
  studentId,
  isVirtual = false
}) => {
  const navigate = useNavigate();
  
  const handleClick = () => {
    navigate(`/teacher/students/profile/${studentId}${isVirtual ? '?virtual=true' : ''}`);
  };
  
  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={handleClick}
      className="flex items-center gap-1"
    >
      <Eye className="h-4 w-4" />
      <span className="hidden sm:inline">Ver Perfil</span>
    </Button>
  );
};

export default StudentProfileButton;
