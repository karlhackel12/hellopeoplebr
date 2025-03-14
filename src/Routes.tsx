
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from '@/pages/auth/Login';
import Register from '@/pages/auth/Register';
import ForgotPassword from '@/pages/auth/ForgotPassword';
import ResetPassword from '@/pages/auth/ResetPassword';
import Dashboard from '@/pages/Dashboard';
import Lessons from '@/pages/teacher/Lessons';
import CreateLesson from '@/pages/teacher/CreateLesson';
import LessonEditor from '@/components/teacher/LessonEditor';
import LessonQuizEditor from '@/pages/teacher/LessonQuizEditor';
import Conversation from '@/pages/student/Conversation';
import StudentDashboard from '@/pages/student/StudentDashboard';
import StudentLessons from '@/pages/student/StudentLessons';
import StudentLesson from '@/pages/student/StudentLesson';
import StudentQuiz from '@/pages/student/StudentQuiz';
import TeacherStudents from '@/pages/teacher/TeacherStudents';
import ProtectedRoute from '@/components/ProtectedRoute';
import InviteStudents from '@/pages/teacher/InviteStudents';
import NotFound from '@/pages/NotFound';
import { RequireRole } from '@/components/RequireRole';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Common routes */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      
      {/* Protected routes */}
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      
      {/* Teacher routes */}
      <Route path="/teacher/lessons" element={
        <RequireRole role="teacher"><Lessons /></RequireRole>
      } />
      <Route path="/teacher/lessons/create" element={
        <RequireRole role="teacher"><CreateLesson /></RequireRole>
      } />
      <Route path="/teacher/lessons/edit/:id" element={
        <RequireRole role="teacher"><LessonEditor /></RequireRole>
      } />
      <Route path="/teacher/lessons/:id/quiz" element={
        <RequireRole role="teacher"><LessonQuizEditor /></RequireRole>
      } />
      <Route path="/teacher/students" element={
        <RequireRole role="teacher"><TeacherStudents /></RequireRole>
      } />
      <Route path="/teacher/invite" element={
        <RequireRole role="teacher"><InviteStudents /></RequireRole>
      } />
      
      {/* Student routes */}
      <Route path="/student/dashboard" element={
        <RequireRole role="student"><StudentDashboard /></RequireRole>
      } />
      <Route path="/student/lessons" element={
        <RequireRole role="student"><StudentLessons /></RequireRole>
      } />
      <Route path="/student/lessons/:id" element={
        <RequireRole role="student"><StudentLesson /></RequireRole>
      } />
      <Route path="/student/quiz/:id" element={
        <RequireRole role="student"><StudentQuiz /></RequireRole>
      } />
      <Route path="/student/conversation" element={
        <RequireRole role="student"><Conversation /></RequireRole>
      } />
      
      {/* Fallback */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
