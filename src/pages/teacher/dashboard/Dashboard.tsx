
import React from 'react';
import TeacherLayout from '@/components/layout/TeacherLayout';

const TeacherDashboard: React.FC = () => {
  return (
    <TeacherLayout>
      <div className="w-full animate-fade-in">
        <h1 className="text-3xl font-bold mb-6">Teacher Dashboard</h1>
        <p>Welcome to your teacher dashboard. From here, you can manage your students, quizzes, and assignments.</p>
      </div>
    </TeacherLayout>
  );
};

export default TeacherDashboard;
