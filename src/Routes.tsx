
import { Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from '@/pages/Dashboard';
import Lessons from '@/pages/teacher/Lessons';
import CreateLesson from '@/pages/teacher/CreateLesson';
import EditLesson from '@/pages/teacher/EditLesson';
import NotFound from '@/pages/NotFound';
import { StudentRoutes } from './routes/studentRoutes';
import { DesignSystemRoutes } from './routes/designSystem';
import LandscapeFooter from './components/layout/LandscapeFooter';
import { useIsMobile } from './hooks/use-mobile';
import Students from '@/pages/teacher/Students';

export default function AppRoutes() {
  const isMobile = useIsMobile();
  
  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1">
        <Routes>
          {/* Common routes */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          {/* Protected routes */}
          <Route path="/dashboard" element={<Dashboard />} />
          
          {/* Teacher routes */}
          <Route path="/teacher/lessons" element={<Lessons />} />
          <Route path="/teacher/lessons/create" element={<CreateLesson />} />
          <Route path="/teacher/lessons/edit/:id" element={<EditLesson />} />
          <Route path="/teacher/students" element={<Students />} />
          
          {/* Student routes */}
          <Route path="/student/*" element={<StudentRoutes />} />
          
          {/* Design System */}
          <Route path="/design/*" element={<DesignSystemRoutes />} />
          
          {/* Fallback */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
      <div className={`${isMobile ? 'fixed bottom-16 left-0 right-0 z-50' : ''}`}>
        <LandscapeFooter />
      </div>
    </div>
  );
}
