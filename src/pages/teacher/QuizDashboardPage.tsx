
import React from 'react';
import TeacherLayout from '@/components/layout/TeacherLayout';
import QuizDashboard from '@/components/teacher/dashboard/QuizDashboard';

const QuizDashboardPage = () => {
  return (
    <TeacherLayout>
      <div className="container mx-auto p-4 md:p-8">
        <QuizDashboard />
      </div>
    </TeacherLayout>
  );
};

export default QuizDashboardPage;
