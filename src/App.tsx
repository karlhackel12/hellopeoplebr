
import { useEffect } from 'react';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import { Toaster } from 'sonner';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Auth components
import Login from '@/pages/auth/Login';
import Register from '@/pages/auth/Register';
import ForgotPassword from '@/pages/auth/ForgotPassword';
import ResetPassword from '@/pages/auth/ResetPassword';
import AuthCallback from '@/pages/auth/AuthCallback';
import StudentSignup from '@/pages/auth/StudentSignup';

// Teacher pages
import TeacherDashboard from '@/pages/teacher/dashboard/Dashboard';
import Students from '@/pages/teacher/students/Students';
import StudentDetail from '@/pages/teacher/students/StudentDetail';
import Quizzes from '@/pages/teacher/quizzes/Quizzes';
import QuizDetail from '@/pages/teacher/quizzes/QuizDetail';
import QuizCreate from '@/pages/teacher/quizzes/QuizCreate';
import QuizEdit from '@/pages/teacher/quizzes/QuizEdit';
import TeacherProfile from '@/pages/teacher/settings/Profile';
import TeacherSettings from '@/pages/teacher/settings/Settings';
import Assignments from '@/pages/teacher/assignments/Assignments';

// Student pages
import StudentDashboard from '@/pages/student/dashboard/Dashboard';
import StudentAssignments from '@/pages/student/assignments/Assignments';
import StudentAssignmentDetail from '@/pages/student/assignments/AssignmentDetail';
import StudentQuizzes from '@/pages/student/quizzes/Quizzes';
import StudentQuiz from '@/pages/student/quizzes/Quiz';
import StudentQuizResults from '@/pages/student/quizzes/QuizResults';
import StudentProfile from '@/pages/student/profile/Profile';
import StudentSettings from '@/pages/student/settings/Settings';

// Protected route components
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import TeacherRoute from '@/components/auth/TeacherRoute';
import StudentRoute from '@/components/auth/StudentRoute';

// Create a React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

const router = createBrowserRouter([
  // Auth routes
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/register',
    element: <Register />,
  },
  {
    path: '/forgot-password',
    element: <ForgotPassword />,
  },
  {
    path: '/reset-password',
    element: <ResetPassword />,
  },
  {
    path: '/auth/callback',
    element: <AuthCallback />,
  },
  {
    path: '/student/signup/:code',
    element: <StudentSignup />,
  },

  // Teacher routes
  {
    path: '/teacher/dashboard',
    element: (
      <ProtectedRoute>
        <TeacherRoute>
          <TeacherDashboard />
        </TeacherRoute>
      </ProtectedRoute>
    ),
  },
  {
    path: '/teacher/students',
    element: (
      <ProtectedRoute>
        <TeacherRoute>
          <Students />
        </TeacherRoute>
      </ProtectedRoute>
    ),
  },
  {
    path: '/teacher/students/:id',
    element: (
      <ProtectedRoute>
        <TeacherRoute>
          <StudentDetail />
        </TeacherRoute>
      </ProtectedRoute>
    ),
  },
  {
    path: '/teacher/quizzes',
    element: (
      <ProtectedRoute>
        <TeacherRoute>
          <Quizzes />
        </TeacherRoute>
      </ProtectedRoute>
    ),
  },
  {
    path: '/teacher/quizzes/create',
    element: (
      <ProtectedRoute>
        <TeacherRoute>
          <QuizCreate />
        </TeacherRoute>
      </ProtectedRoute>
    ),
  },
  {
    path: '/teacher/quizzes/:id',
    element: (
      <ProtectedRoute>
        <TeacherRoute>
          <QuizDetail />
        </TeacherRoute>
      </ProtectedRoute>
    ),
  },
  {
    path: '/teacher/quizzes/:id/edit',
    element: (
      <ProtectedRoute>
        <TeacherRoute>
          <QuizEdit />
        </TeacherRoute>
      </ProtectedRoute>
    ),
  },
  {
    path: '/teacher/assignments',
    element: (
      <ProtectedRoute>
        <TeacherRoute>
          <Assignments />
        </TeacherRoute>
      </ProtectedRoute>
    ),
  },
  {
    path: '/teacher/settings',
    element: (
      <ProtectedRoute>
        <TeacherRoute>
          <TeacherSettings />
        </TeacherRoute>
      </ProtectedRoute>
    ),
  },
  {
    path: '/teacher/profile',
    element: (
      <ProtectedRoute>
        <TeacherRoute>
          <TeacherProfile />
        </TeacherRoute>
      </ProtectedRoute>
    ),
  },

  // Student routes
  {
    path: '/student/dashboard',
    element: (
      <ProtectedRoute>
        <StudentRoute>
          <StudentDashboard />
        </StudentRoute>
      </ProtectedRoute>
    ),
  },
  {
    path: '/student/assignments',
    element: (
      <ProtectedRoute>
        <StudentRoute>
          <StudentAssignments />
        </StudentRoute>
      </ProtectedRoute>
    ),
  },
  {
    path: '/student/assignments/:id',
    element: (
      <ProtectedRoute>
        <StudentRoute>
          <StudentAssignmentDetail />
        </StudentRoute>
      </ProtectedRoute>
    ),
  },
  {
    path: '/student/quizzes',
    element: (
      <ProtectedRoute>
        <StudentRoute>
          <StudentQuizzes />
        </StudentRoute>
      </ProtectedRoute>
    ),
  },
  {
    path: '/student/quizzes/:id',
    element: (
      <ProtectedRoute>
        <StudentRoute>
          <StudentQuiz />
        </StudentRoute>
      </ProtectedRoute>
    ),
  },
  {
    path: '/student/quizzes/:id/results/:attemptId',
    element: (
      <ProtectedRoute>
        <StudentRoute>
          <StudentQuizResults />
        </StudentRoute>
      </ProtectedRoute>
    ),
  },
  {
    path: '/student/profile',
    element: (
      <ProtectedRoute>
        <StudentRoute>
          <StudentProfile />
        </StudentRoute>
      </ProtectedRoute>
    ),
  },
  {
    path: '/student/settings',
    element: (
      <ProtectedRoute>
        <StudentRoute>
          <StudentSettings />
        </StudentRoute>
      </ProtectedRoute>
    ),
  },
  
  // Default redirect
  {
    path: '*',
    element: <Login />,
  },
]);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <Toaster position="top-right" />
    </QueryClientProvider>
  );
}

export default App;
