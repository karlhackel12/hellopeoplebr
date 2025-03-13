
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { PageTransitionWrapper } from "@/components/ui/page-transition";
import { OnboardingProvider } from "./components/student/OnboardingContext";

// Auth Pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import InvitationAcceptancePage from "./pages/InvitationAcceptance";

// Landing & Common Pages
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Dashboard from "./pages/Dashboard";

// Teacher Pages
import TeacherDashboard from "./pages/teacher/Dashboard";
import Lessons from "./pages/teacher/Lessons";
import LessonEditor from "./components/teacher/LessonEditor";
import LessonPreviewPage from "./pages/teacher/LessonPreviewPage";
import LessonQuizPage from "./pages/teacher/LessonQuizPage";
import Invitations from "./pages/teacher/Invitations";
import Students from "./pages/teacher/Students";
import Assignments from "./pages/teacher/Assignments";
import Settings from "./pages/teacher/Settings";

// Quiz Pages
import QuizDashboardPage from "./pages/teacher/QuizDashboardPage";
import QuizListPage from "./pages/teacher/QuizListPage";
import QuizAssignmentPage from "./pages/teacher/QuizAssignmentPage";

// Student Pages
import StudentDashboard from "./pages/student/Dashboard";
import StudentLessons from "./pages/student/Lessons";
import StudentSettings from "./pages/student/Settings";
import LessonView from "./pages/student/LessonView";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <OnboardingProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Index />} />
            <Route path="/login" element={
              <PageTransitionWrapper><Login /></PageTransitionWrapper>
            } />
            <Route path="/register" element={
              <PageTransitionWrapper><Register /></PageTransitionWrapper>
            } />
            <Route path="/forgot-password" element={
              <PageTransitionWrapper><ForgotPassword /></PageTransitionWrapper>
            } />
            <Route path="/invitation" element={<InvitationAcceptancePage />} />
            <Route path="/invitation/:code" element={<InvitationAcceptancePage />} />
            
            {/* Common Routes */}
            <Route path="/dashboard" element={<Dashboard />} />
            
            {/* Teacher Routes */}
            <Route path="/teacher">
              <Route path="dashboard" element={
                <PageTransitionWrapper><TeacherDashboard /></PageTransitionWrapper>
              } />
              
              {/* Lesson Routes */}
              <Route path="lessons" element={
                <PageTransitionWrapper><Lessons /></PageTransitionWrapper>
              } />
              <Route path="lessons/create" element={
                <PageTransitionWrapper><LessonEditor /></PageTransitionWrapper>
              } />
              <Route path="lessons/edit/:id" element={
                <PageTransitionWrapper><LessonEditor /></PageTransitionWrapper>
              } />
              <Route path="lessons/preview/:id" element={
                <PageTransitionWrapper><LessonPreviewPage /></PageTransitionWrapper>
              } />
              <Route path="lessons/:lessonId/quiz" element={
                <PageTransitionWrapper><LessonQuizPage /></PageTransitionWrapper>
              } />
              
              {/* Quiz Management Routes */}
              <Route path="quizzes" element={
                <PageTransitionWrapper><QuizDashboardPage /></PageTransitionWrapper>
              } />
              <Route path="quizzes/list" element={
                <PageTransitionWrapper><QuizListPage /></PageTransitionWrapper>
              } />
              <Route path="quizzes/assign" element={
                <PageTransitionWrapper><QuizAssignmentPage /></PageTransitionWrapper>
              } />
              
              {/* Student Management Routes */}
              <Route path="invitations" element={
                <PageTransitionWrapper><Invitations /></PageTransitionWrapper>
              } />
              <Route path="students" element={
                <PageTransitionWrapper><Students /></PageTransitionWrapper>
              } />
              <Route path="assignments" element={
                <PageTransitionWrapper><Assignments /></PageTransitionWrapper>
              } />
              
              {/* Settings */}
              <Route path="settings" element={
                <PageTransitionWrapper><Settings /></PageTransitionWrapper>
              } />
            </Route>
            
            {/* Student Routes */}
            <Route path="/student">
              <Route path="dashboard" element={
                <PageTransitionWrapper><StudentDashboard /></PageTransitionWrapper>
              } />
              <Route path="lessons" element={
                <PageTransitionWrapper><StudentLessons /></PageTransitionWrapper>
              } />
              <Route path="lessons/view/:lessonId" element={
                <PageTransitionWrapper><LessonView /></PageTransitionWrapper>
              } />
              <Route path="settings" element={
                <PageTransitionWrapper><StudentSettings /></PageTransitionWrapper>
              } />
            </Route>
            
            {/* Redirects */}
            <Route path="/teacher" element={<Navigate to="/teacher/dashboard" replace />} />
            <Route path="/student" element={<Navigate to="/student/dashboard" replace />} />
            
            {/* 404 route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </OnboardingProvider>
  </QueryClientProvider>
);

export default App;
