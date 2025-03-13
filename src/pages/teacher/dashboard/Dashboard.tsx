
import React from 'react';
import TeacherLayout from '@/components/layout/TeacherLayout';
import DashboardHeader from '@/components/teacher/dashboard/DashboardHeader';
import StatCards from '@/components/teacher/dashboard/StatCards';
import RecentLessons from '@/components/teacher/dashboard/RecentLessons';

const TeacherDashboard: React.FC = () => {
  return (
    <TeacherLayout>
      <div className="w-full animate-fade-in">
        <DashboardHeader />
        <StatCards />
        <RecentLessons />
      </div>
    </TeacherLayout>
  );
};

export default TeacherDashboard;
