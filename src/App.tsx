
import { useEffect } from 'react';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import { Toaster } from 'sonner';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Auth Components
import Login from 'src/pages/auth/Login';
// Teacher Components
import TeacherDashboard from 'src/pages/teacher/dashboard/Dashboard';
// Protected Route Components
import ProtectedRoute from 'src/components/auth/ProtectedRoute';
import TeacherRoute from 'src/components/auth/TeacherRoute';
import StudentRoute from 'src/components/auth/StudentRoute';

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
