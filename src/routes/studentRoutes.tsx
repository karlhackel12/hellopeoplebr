
import React, { lazy } from 'react';
import { RouteObject } from 'react-router-dom';

// Lazy load components
const StudentDashboard = lazy(() => import('@/pages/student/Dashboard'));
const LessonsList = lazy(() => import('@/pages/student/Lessons'));
const LessonView = lazy(() => import('@/pages/student/LessonView'));
const SpacedRepetition = lazy(() => import('@/pages/student/SpacedRepetition'));
const QuizView = lazy(() => import('@/pages/student/SpacedRepetition'));
const StudentSettings = lazy(() => import('@/pages/student/Settings'));
const VoicePracticeConstruction = lazy(() => import('@/pages/student/VoicePracticeConstruction'));

export const studentRoutes: RouteObject[] = [
  {
    path: 'student',
    element: <div className="student-protected-route"><React.Suspense fallback={<div>Loading...</div>}>{(props: any) => props.children}</React.Suspense></div>,
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
        path: 'voice-practice',
        element: <VoicePracticeConstruction />,
      },
      {
        path: 'voice-practice/session',
        element: <VoicePracticeConstruction />,
      },
      {
        path: 'voice-practice/session/:sessionId',
        element: <VoicePracticeConstruction />,
      },
      {
        path: 'settings',
        element: <StudentSettings />,
      },
    ],
  },
];
