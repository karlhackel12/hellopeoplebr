
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

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8">
      <div className="glass hover:shadow-md transition-all duration-300 rounded-lg p-5 flex flex-col h-full">
        <h3 className="font-semibold text-primary mb-1 flex items-center">
          <Users className="h-4 w-4 mr-2" />
          Students
        </h3>
        <p className="text-muted-foreground mb-4 text-sm">Invite and manage your students</p>
        <p className="mt-auto">
          <Button variant="outline" className="w-full hover:scale-105 transition-all" onClick={handleManageStudents}>
            Manage Students
          </Button>
        </p>
      </div>
      
      <div className="glass hover:shadow-md transition-all duration-300 rounded-lg p-5 flex flex-col h-full">
        <h3 className="font-semibold text-primary mb-1 flex items-center">
          <BookOpen className="h-4 w-4 mr-2" />
          Lessons
        </h3>
        <p className="text-muted-foreground mb-4 text-sm">Create and manage your teaching materials</p>
        <p className="mt-auto">
          <Button variant="outline" className="w-full hover:scale-105 transition-all" onClick={handleCreateLesson}>
            Create Lesson
          </Button>
        </p>
      </div>
      
      <div className="glass hover:shadow-md transition-all duration-300 rounded-lg p-5 flex flex-col h-full">
        <h3 className="font-semibold text-primary mb-1 flex items-center">
          <ClipboardList className="h-4 w-4 mr-2" />
          Assignments
        </h3>
        <p className="text-muted-foreground mb-4 text-sm">Assign lessons and quizzes to students</p>
        <p className="mt-auto">
          <Button variant="outline" className="w-full hover:scale-105 transition-all" onClick={handleManageAssignments}>
            Manage Assignments
          </Button>
        </p>
      </div>
    </div>
  );
};

export default StatCards;
