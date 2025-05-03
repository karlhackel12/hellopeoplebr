import React from 'react';
import TeacherLayout from '@/components/layout/TeacherLayout';
import DashboardHeader from '@/components/teacher/dashboard/DashboardHeader';
import StatCards from '@/components/teacher/dashboard/StatCards';
import AnalyticsCards from '@/components/teacher/dashboard/AnalyticsCards';
import PerformanceChart from '@/components/teacher/dashboard/PerformanceChart';

const TeacherDashboard: React.FC = () => {
  return (
    <TeacherLayout pageTitle="Painel de Controle">
      <div className="w-full animate-fade-in space-y-6">
        <DashboardHeader />
        
        {/* Ações Rápidas */}
        <StatCards />
        
        {/* Cartões de Análise */}
        <AnalyticsCards />
        
        {/* Gráfico de Desempenho */}
        <PerformanceChart />
      </div>
    </TeacherLayout>
  );
};

export default TeacherDashboard;
