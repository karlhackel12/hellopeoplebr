
import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { 
  PlusCircle, 
  FileQuestion, 
  BookOpen, 
  Users, 
  Mail, 
  BookCheck,
  BookText
} from 'lucide-react';

const TeacherDashboardActions: React.FC = () => {
  const navigate = useNavigate();
  
  const actions = [
    {
      title: 'Create Lesson',
      description: 'Create a new lesson for your students',
      icon: <BookOpen className="h-5 w-5" />,
      action: () => navigate('/teacher/lessons/create'),
      primary: true
    },
    {
      title: 'Manage Quizzes',
      description: 'Create and manage quizzes for your lessons',
      icon: <FileQuestion className="h-5 w-5" />,
      action: () => navigate('/teacher/quizzes'),
      primary: false
    },
    {
      title: 'Assign Quizzes',
      description: 'Assign quizzes to your students',
      icon: <BookText className="h-5 w-5" />,
      action: () => navigate('/teacher/quizzes/assign'),
      primary: false
    },
    {
      title: 'Manage Assignments',
      description: 'View and manage student assignments',
      icon: <BookCheck className="h-5 w-5" />,
      action: () => navigate('/teacher/assignments'),
      primary: false
    },
    {
      title: 'Invite Students',
      description: 'Send invitations to your students',
      icon: <Mail className="h-5 w-5" />,
      action: () => navigate('/teacher/invitations'),
      primary: false
    },
    {
      title: 'Manage Students',
      description: 'View and manage your students',
      icon: <Users className="h-5 w-5" />,
      action: () => navigate('/teacher/students'),
      primary: false
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {actions.map((action, index) => (
        <Button
          key={index}
          variant={action.primary ? "default" : "outline"}
          className={`h-auto p-4 justify-start text-left flex flex-col items-start gap-2 ${
            action.primary ? "bg-primary hover:bg-primary/90" : "hover:bg-muted"
          }`}
          onClick={action.action}
        >
          <div className={`rounded-md p-2 ${action.primary ? "bg-primary-foreground/10" : "bg-background"}`}>
            {action.icon}
          </div>
          <div className="flex flex-col">
            <span className="font-medium text-base">{action.title}</span>
            <span className={`text-xs ${action.primary ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
              {action.description}
            </span>
          </div>
          {action.primary && (
            <PlusCircle className="h-4 w-4 absolute top-3 right-3 text-primary-foreground/80" />
          )}
        </Button>
      ))}
    </div>
  );
};

export default TeacherDashboardActions;
