
import { Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from '@/pages/Dashboard';
import Lessons from '@/pages/teacher/Lessons';
import CreateLesson from '@/pages/teacher/CreateLesson';
import LessonEditor from '@/components/teacher/LessonEditor';
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
      <Route path="/teacher/lessons/edit/:id" element={<LessonEditor />} />
      
      {/* Fallback */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
