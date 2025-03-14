import React from 'react';
import { Button } from '@/components/ui/button';
import { Users, ClipboardList, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
const StatCards: React.FC = () => {
  const navigate = useNavigate();
  const handleManageStudents = () => {
    navigate('/teacher/invitations');
  };
  const handleCreateLesson = () => {
    navigate('/teacher/lessons/create');
  };
  const handleManageAssignments = () => {
    navigate('/teacher/assignments');
  };
  return <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8">
      
      
      
      
      
    </div>;
};
export default StatCards;