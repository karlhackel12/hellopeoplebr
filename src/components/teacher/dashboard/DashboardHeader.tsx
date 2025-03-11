
import React from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DashboardHeader: React.FC = () => {
  const navigate = useNavigate();

  const handleCreateLesson = () => {
    navigate('/teacher/lessons/create');
  };

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-gradient">Teacher Dashboard</h1>
      <Button onClick={handleCreateLesson} className="gap-2 whitespace-nowrap transition-all duration-300 hover:scale-105">
        <PlusCircle className="h-4 w-4" />
        <span className="hidden sm:inline">Create Lesson</span>
        <span className="sm:hidden">New Lesson</span>
      </Button>
    </div>
  );
};

export default DashboardHeader;
