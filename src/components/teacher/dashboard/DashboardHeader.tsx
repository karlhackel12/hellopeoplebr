import React from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
const DashboardHeader: React.FC = () => {
  const navigate = useNavigate();
  const handleCreateLesson = () => {
    navigate('/teacher/lessons/create');
  };
  return <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
      
      
    </div>;
};
export default DashboardHeader;