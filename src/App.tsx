import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { PageTransitionWrapper } from "@/components/ui/page-transition";

import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import NotFound from "./pages/NotFound";
import Dashboard from "./pages/Dashboard";
import TeacherDashboard from "./pages/teacher/Dashboard";
import Invitations from "./pages/teacher/Invitations";
import Students from "./pages/teacher/Students";
import Assignments from "./pages/teacher/Assignments";
import Settings from "./pages/teacher/Settings";
import SidebarDemoPage from "./pages/SidebarDemo";
import InvitationAcceptancePage from "./pages/InvitationAcceptance";
import { OnboardingProvider } from "./components/student/OnboardingContext";

// Quiz pages
import QuizManagementPage from "./pages/teacher/QuizManagementPage";
import QuizCreatePage from "./pages/teacher/QuizCreatePage";
import QuizEditPage from "./pages/teacher/QuizEditPage";
import QuizPreviewPage from "./pages/teacher/QuizPreviewPage";

// Student Pages
import StudentDashboard from "./pages/student/Dashboard";
import StudentSettings from "./pages/student/Settings";
import StudentQuizList from "./pages/student/QuizList";
import TakeQuizPage from "./pages/student/TakeQuizPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <OnboardingProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={
              <PageTransitionWrapper>
                <Login />
              </PageTransitionWrapper>
            } />
            <Route path="/register" element={
              <PageTransitionWrapper>
                <Register />
              </PageTransitionWrapper>
            } />
            <Route path="/forgot-password" element={
              <PageTransitionWrapper>
                <ForgotPassword />
              </PageTransitionWrapper>
            } />
            <Route path="/dashboard" element={
              <PageTransitionWrapper>
                <Dashboard />
              </PageTransitionWrapper>
            } />
            <Route path="/sidebar-demo" element={<SidebarDemoPage />} />
            
            {/* Invitation routes - both with and without code parameter */}
            <Route path="/invitation" element={<InvitationAcceptancePage />} />
            <Route path="/invitation/:code" element={<InvitationAcceptancePage />} />
            
            {/* Teacher Routes */}
            <Route path="/teacher/dashboard" element={
              <PageTransitionWrapper>
                <TeacherDashboard />
              </PageTransitionWrapper>
            } />
            
            {/* Quiz Management Routes */}
            <Route path="/teacher/quizzes" element={
              <PageTransitionWrapper>
                <QuizManagementPage />
              </PageTransitionWrapper>
            } />
            <Route path="/teacher/quizzes/create" element={
              <PageTransitionWrapper>
                <QuizCreatePage />
              </PageTransitionWrapper>
            } />
            <Route path="/teacher/quizzes/edit/:quizId" element={
              <PageTransitionWrapper>
                <QuizEditPage />
              </PageTransitionWrapper>
            } />
            <Route path="/teacher/quizzes/preview/:quizId" element={
              <PageTransitionWrapper>
                <QuizPreviewPage />
              </PageTransitionWrapper>
            } />
            
            {/* Other Teacher Routes */}
            <Route path="/teacher/invitations" element={
              <PageTransitionWrapper>
                <Invitations />
              </PageTransitionWrapper>
            } />
            <Route path="/teacher/students" element={
              <PageTransitionWrapper>
                <Students />
              </PageTransitionWrapper>
            } />
            <Route path="/teacher/assignments" element={
              <PageTransitionWrapper>
                <Assignments />
              </PageTransitionWrapper>
            } />
            <Route path="/teacher/settings" element={
              <PageTransitionWrapper>
                <Settings />
              </PageTransitionWrapper>
            } />
            
            {/* Student Routes */}
            <Route path="/student/dashboard" element={
              <PageTransitionWrapper>
                <StudentDashboard />
              </PageTransitionWrapper>
            } />
            <Route path="/student/quizzes" element={
              <PageTransitionWrapper>
                <StudentQuizList />
              </PageTransitionWrapper>
            } />
            <Route path="/student/quizzes/take/:quizId" element={
              <PageTransitionWrapper>
                <TakeQuizPage />
              </PageTransitionWrapper>
            } />
            <Route path="/student/settings" element={
              <PageTransitionWrapper>
                <StudentSettings />
              </PageTransitionWrapper>
            } />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </OnboardingProvider>
  </QueryClientProvider>
);

export default App;
