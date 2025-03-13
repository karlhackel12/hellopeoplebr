
import { useEffect } from 'react';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import { Toaster } from 'sonner';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Auth Pages
import Login from '@/pages/auth/Login';
import Register from '@/pages/auth/Register';
import ForgotPassword from '@/pages/auth/ForgotPassword';
import InvitationAcceptancePage from '@/pages/InvitationAcceptance';

// Teacher Components
import TeacherDashboard from '@/pages/teacher/dashboard/Dashboard';

// Protected Route Components
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

// Simplified router config with placeholder components
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
    path: '/invitation/:code',
    element: <InvitationAcceptancePage />,
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
