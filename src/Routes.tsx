
import { Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from '@/pages/Dashboard';
import Lessons from '@/pages/teacher/Lessons';
import CreateLesson from '@/pages/teacher/CreateLesson';
import EditLesson from '@/pages/teacher/EditLesson';
import NotFound from '@/pages/NotFound';
import VoicePractice from '@/pages/student/VoicePractice';
import VoicePracticeSession from '@/pages/student/VoicePracticeSession';
import VoicePracticeConstruction from '@/pages/student/VoicePracticeConstruction';
import { StudentRoutes } from './routes/studentRoutes';
import LandscapeFooter from './components/layout/LandscapeFooter';

export default function AppRoutes() {
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
          
          {/* Student routes */}
          <Route path="/student/*" element={<StudentRoutes />} />
          
          {/* Voice Practice */}
          <Route path="/student/voice-practice" element={<VoicePractice />} />
          <Route path="/student/voice-practice-construction" element={<VoicePracticeConstruction />} />
          <Route path="/student/voice-practice/session/:sessionId" element={<VoicePracticeSession />} />
          
          {/* Fallback */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
      <LandscapeFooter />
    </div>
  );
}
