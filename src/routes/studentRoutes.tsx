
import React from 'react';
import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import StudentLayout from '@/components/layout/StudentLayout';
import LessonView from '@/pages/student/LessonView';
import SpacedRepetitionPage from '@/pages/student/SpacedRepetition';
import StudentDashboard from '@/pages/student/Dashboard';
import LessonsList from '@/pages/student/Lessons';
import StudentSettings from '@/pages/student/Settings';

// Implementação simples do StudentProtectedRoute para evitar erros
const StudentProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  // Esta é uma implementação simplificada - na versão real você verificaria a autenticação
  return <>{children}</>;
};

const QuizView = () => <div>Visualização de Quiz</div>;

export const StudentRoutes = () => {
  return (
    <Routes>
      <Route
        path="/*"
        element={
          <StudentProtectedRoute>
            <StudentLayout>
              <Routes>
                <Route path="/" element={<Navigate to="/student/dashboard" replace />} />
                <Route path="dashboard" element={<StudentDashboard />} />
                <Route path="lessons" element={<LessonsList />} />
                <Route path="lessons/view/:lessonId" element={<LessonView />} />
                <Route path="quizzes/view/:quizId" element={<QuizView />} />
                <Route path="quizzes/take/:quizId" element={<QuizView />} />
                <Route path="settings" element={<StudentSettings />} />
                <Route path="spaced-repetition" element={<SpacedRepetitionPage />} />
                <Route path="*" element={<Navigate to="/student/dashboard" replace />} />
              </Routes>
            </StudentLayout>
          </StudentProtectedRoute>
        }
      />
    </Routes>
  );
};
