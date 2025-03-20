import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { PageTransitionWrapper } from "@/components/ui/page-transition";

import Index from "./pages/Index";
import TeacherLanding from "./pages/landing/TeacherLanding";
import StudentLanding from "./pages/landing/StudentLanding";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import NotFound from "./pages/NotFound";
import Dashboard from "./pages/Dashboard";
import TeacherDashboard from "./pages/teacher/Dashboard";
import CreateLesson from "./pages/teacher/CreateLesson";
import EditLesson from "./pages/teacher/EditLesson";
import Invitations from "./pages/teacher/Invitations";
import Students from "./pages/teacher/Students";
import StudentProfile from "./pages/teacher/StudentProfile";
import Assignments from "./pages/teacher/Assignments";
import Lessons from "./pages/teacher/Lessons";
import Settings from "./pages/teacher/Settings";
import LessonPreviewPage from "./pages/teacher/LessonPreviewPage";
import SidebarDemoPage from "./pages/SidebarDemo";
import InvitationAcceptancePage from "./pages/InvitationAcceptance";
import { OnboardingProvider } from "./components/student/OnboardingContext";
import LessonQuizPage from "./pages/teacher/LessonQuizPage";

// Student Pages
import StudentDashboard from "./pages/student/Dashboard";
import StudentLessons from "./pages/student/Lessons";
import StudentSettings from "./pages/student/Settings";
import LessonView from "./pages/student/LessonView";
import SpacedRepetition from "./pages/student/SpacedRepetition";
import SpacedRepetitionReview from "./pages/student/SpacedRepetitionReview";
import VoicePractice from "./pages/student/VoicePractice";
import VoicePracticeSession from "./pages/student/VoicePracticeSession";

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
            <Route path="/teachers" element={
              <PageTransitionWrapper>
                <TeacherLanding />
              </PageTransitionWrapper>
            } />
            <Route path="/students" element={
              <PageTransitionWrapper>
                <StudentLanding />
              </PageTransitionWrapper>
            } />
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
            <Route path="/teacher/lessons" element={
              <PageTransitionWrapper>
                <Lessons />
              </PageTransitionWrapper>
            } />
            <Route path="/teacher/lessons/create" element={
              <PageTransitionWrapper>
                <CreateLesson />
              </PageTransitionWrapper>
            } />
            <Route path="/teacher/lessons/edit/:id" element={
              <PageTransitionWrapper>
                <EditLesson />
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
            <Route path="/teacher/students/profile/:studentId" element={
              <PageTransitionWrapper>
                <StudentProfile />
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
            <Route path="/student/lessons" element={
              <PageTransitionWrapper>
                <StudentLessons />
              </PageTransitionWrapper>
            } />
            <Route path="/student/assignments" element={
              <Navigate to="/student/lessons" replace />
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
            <Route path="/student/spaced-repetition" element={
              <PageTransitionWrapper>
                <SpacedRepetition />
              </PageTransitionWrapper>
            } />
            <Route path="/student/spaced-repetition/review" element={
              <PageTransitionWrapper>
                <SpacedRepetitionReview />
              </PageTransitionWrapper>
            } />
            <Route path="/student/voice-practice" element={
              <PageTransitionWrapper>
                <VoicePractice />
              </PageTransitionWrapper>
            } />
            <Route path="/student/voice-practice/session" element={
              <PageTransitionWrapper>
                <VoicePracticeSession />
              </PageTransitionWrapper>
            } />
            <Route path="/student/voice-practice/session/:sessionId" element={
              <PageTransitionWrapper>
                <VoicePracticeSession />
              </PageTransitionWrapper>
            } />
            
            {/* Rota para corrigir erro de digitação */}
            <Route path="/student/voice-pratice" element={
              <Navigate to="/student/voice-practice" replace />
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
