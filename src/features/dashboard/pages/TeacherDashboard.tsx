
import React from 'react';
import TeacherLayout from '@/components/layout/TeacherLayout';
import DashboardHeader from '@/components/teacher/dashboard/DashboardHeader';
import StatCards from '@/components/teacher/dashboard/StatCards';
import AnalyticsCards from '@/components/teacher/dashboard/AnalyticsCards';
import RecentLessons from '@/components/teacher/dashboard/RecentLessons';
import StudentSearch from '@/components/teacher/dashboard/StudentSearch';
import PerformanceChart from '@/components/teacher/dashboard/PerformanceChart';

const TeacherDashboard: React.FC = () => {
  return (
    <TeacherLayout pageTitle="Painel de Controle">
      <div className="w-full animate-fade-in space-y-6">
        <DashboardHeader />
        
        {/* Analytics Cards */}
        <AnalyticsCards />
        
        {/* Performance Chart and Student Search */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <PerformanceChart />
          <StudentSearch />
        </div>
        
        {/* Quick Actions */}
        <StatCards />
        
        {/* Recent Lessons */}
        <RecentLessons />
      </div>
    </TeacherLayout>
  );
};

export default TeacherDashboard;
