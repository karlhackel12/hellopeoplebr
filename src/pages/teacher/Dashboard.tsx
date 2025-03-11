
import React from 'react';
import TeacherLayout from '@/components/layout/TeacherLayout';
import DashboardHeader from '@/components/teacher/dashboard/DashboardHeader';
import StatCards from '@/components/teacher/dashboard/StatCards';
import RecentLessons from '@/components/teacher/dashboard/RecentLessons';
import OnboardingProgress from '@/components/teacher/dashboard/OnboardingProgress';
import { Button } from '@/components/ui/button';
import { Users } from 'lucide-react';
import { Link } from 'react-router-dom';

const TeacherDashboard: React.FC = () => {
  return (
    <TeacherLayout>
      <div className="w-full animate-fade-in">
        <DashboardHeader />
        <StatCards />
        
        <div className="flex flex-col md:flex-row items-start justify-between mb-6">
          <h2 className="text-2xl font-bold mb-4 md:mb-0">Student Onboarding Progress</h2>
          <Link to="/teacher/students">
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>Manage Students</span>
            </Button>
          </Link>
        </div>
        
        <OnboardingProgress />
        <RecentLessons />
      </div>
    </TeacherLayout>
  );
};

export default TeacherDashboard;
