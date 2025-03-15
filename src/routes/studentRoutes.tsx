
import React, { lazy } from 'react';
import { RouteObject } from 'react-router-dom';
import StudentProtectedRoute from '@/components/auth/StudentProtectedRoute';

// Lazy load components
const StudentDashboard = lazy(() => import('@/pages/student/StudentDashboard'));
const LessonsList = lazy(() => import('@/pages/student/LessonsList'));
const LessonView = lazy(() => import('@/pages/student/LessonView'));
const SpacedRepetition = lazy(() => import('@/pages/student/SpacedRepetition'));
const QuizView = lazy(() => import('@/pages/student/QuizView'));
const StudentSettings = lazy(() => import('@/pages/student/StudentSettings'));
const VoicePracticeConstruction = lazy(() => import('@/pages/student/VoicePracticeConstruction'));

export const studentRoutes: RouteObject[] = [
  {
    path: 'student',
    element: <StudentProtectedRoute />,
    children: [
      {
        path: 'dashboard',
        element: <StudentDashboard />,
      },
      {
        path: 'lessons',
        element: <LessonsList />,
      },
      {
        path: 'lessons/:lessonId',
        element: <LessonView />,
      },
      {
        path: 'spaced-repetition',
        element: <SpacedRepetition />,
      },
      {
        path: 'quiz/:quizId',
        element: <QuizView />,
      },
      {
        path: 'voice-practice-construction',
        element: <VoicePracticeConstruction />,
      },
      {
        path: 'settings',
        element: <StudentSettings />,
      },
    ],
  },
];
