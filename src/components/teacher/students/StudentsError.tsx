
import React from 'react';
import TeacherLayout from '@/components/layout/TeacherLayout';

const StudentsError: React.FC = () => {
  return (
    <TeacherLayout>
      <div className="animate-fade-in">
        <h1 className="text-3xl font-bold mb-6">Student Management</h1>
        <div className="bg-destructive/10 text-destructive rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-2">Failed to load students</h2>
          <p>Please try refreshing the page or contact support if the problem persists.</p>
        </div>
      </div>
    </TeacherLayout>
  );
};

export default StudentsError;
