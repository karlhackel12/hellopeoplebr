
import { useEffect } from 'react';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import { Toaster } from 'sonner';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Create a React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

// Simplified router config - temporary placeholder components
const PlaceholderComponent = () => <div>This page is under construction</div>;

const router = createBrowserRouter([
  // Default route
  {
    path: '*',
    element: <div>Welcome to the application. Please login to continue.</div>,
  },
  // Teacher dashboard as the main entry point for now
  {
    path: '/teacher/dashboard',
    element: <div>Teacher Dashboard</div>,
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
