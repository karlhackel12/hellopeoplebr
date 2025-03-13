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
import LessonEditor from "./components/teacher/LessonEditor";
import Invitations from "./pages/teacher/Invitations";
import Students from "./pages/teacher/Students";
import Assignments from "./pages/teacher/Assignments";
import Lessons from "./pages/teacher/Lessons";
import Settings from "./pages/teacher/Settings";
import LessonPreviewPage from "./pages/teacher/LessonPreviewPage";
import SidebarDemoPage from "./pages/SidebarDemo";
import InvitationAcceptancePage from "./pages/InvitationAcceptance";
import { OnboardingProvider } from "./components/student/OnboardingContext";
import LessonQuizPage from "./pages/teacher/LessonQuizPage";
import TeacherQuiz from "./pages/teacher/Quiz";

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
            
            <Route path="/invitation" element={<InvitationAcceptancePage />} />
            <Route path="/invitation/:code" element={<InvitationAcceptancePage />} />
            
            <Route path="/teacher/dashboard" element={
              <PageTransitionWrapper>
                <TeacherDashboard />
              </PageTransitionWrapper>
            } />
            <Route path="/teacher/lessons" element={
              <PageTransitionWrapper>
                <Lessons />
              </PageTransitionWrapper>
            } />
            <Route path="/teacher/lessons/create" element={
              <PageTransitionWrapper>
                <LessonEditor />
              </PageTransitionWrapper>
            } />
            <Route path="/teacher/lessons/edit/:id" element={
              <PageTransitionWrapper>
                <LessonEditor />
              </PageTransitionWrapper>
            } />
            <Route path="/teacher/lessons/preview/:id" element={
              <PageTransitionWrapper>
                <LessonPreviewPage />
              </PageTransitionWrapper>
            } />
            <Route path="/teacher/lessons/:lessonId/quiz" element={
              <PageTransitionWrapper>
                <LessonQuizPage />
              </PageTransitionWrapper>
            } />
            <Route path="/teacher/quiz" element={
              <PageTransitionWrapper>
                <TeacherQuiz />
              </PageTransitionWrapper>
            } />
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
            
            <Route path="/student/dashboard" element={
              <PageTransitionWrapper>
                <StudentDashboard />
              </PageTransitionWrapper>
            } />
            <Route path="/student/lessons" element={
              <PageTransitionWrapper>
                <StudentLessons />
              </PageTransitionWrapper>
            } />
            <Route path="/student/lessons/view/:lessonId" element={
              <PageTransitionWrapper>
                <LessonView />
              </PageTransitionWrapper>
            } />
            <Route path="/student/settings" element={
              <PageTransitionWrapper>
                <StudentSettings />
              </PageTransitionWrapper>
            } />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </OnboardingProvider>
  </QueryClientProvider>
);

export default App;
