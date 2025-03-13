
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TeacherLayout from '@/components/layout/TeacherLayout';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const Invitations = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Redirect to the new Students page when this page is accessed
    navigate('/teacher/students', { state: { initialTab: 'invitations' } });
  }, [navigate]);

  return (
    <TeacherLayout>
      <div className="animate-fade-in">
        <h1 className="text-3xl font-bold mb-6">Redirecting...</h1>
        <p className="mb-4">
          The invitations page has been moved to the new Students management page.
        </p>
        <Button
          onClick={() => navigate('/teacher/students')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Go to Students</span>
        </Button>
      </div>
    </TeacherLayout>
  );
};

export default Invitations;
