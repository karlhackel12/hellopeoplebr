
import { Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from '@/pages/Dashboard';
import Lessons from '@/pages/teacher/Lessons';
import CreateLesson from '@/pages/teacher/CreateLesson';
import NotFound from '@/pages/NotFound';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Common routes */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      
      {/* Protected routes */}
      <Route path="/dashboard" element={<Dashboard />} />
      
      {/* Teacher routes */}
      <Route path="/teacher/lessons" element={<Lessons />} />
      <Route path="/teacher/lessons/create" element={<CreateLesson />} />
      
      {/* Fallback */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
