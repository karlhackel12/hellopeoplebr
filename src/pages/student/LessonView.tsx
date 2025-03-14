
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { Separator } from "@/components/ui/separator";
import { useLessonData } from './hooks/useLessonData';
import { useLessonProgress } from './hooks/useLessonProgress';
import LessonHeader from './components/LessonHeader';
import LessonNavigation from './components/lesson/LessonNavigation';
import LessonContent from './components/lesson/LessonContent';
import QuizSection from './components/lesson/QuizSection';
import { extractSections } from '@/utils/markdownUtils';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const LessonView: React.FC = () => {
  const { lessonId = '' } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Fetch lesson data
  const { lesson, lessonLoading, quiz, quizQuestions } = useLessonData(lessonId);
  
  // Lesson progress management
  const { lessonProgress, updateProgress } = useLessonProgress(lessonId);
  
  // UI state
  const [currentTab, setCurrentTab] = useState<'content' | 'quiz'>('content');
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [sections, setSections] = useState<Array<{id: string, title: string, content: string}>>([]);
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Extract sections from lesson content
  useEffect(() => {
    if (lesson?.content) {
      const extractedSections = extractSections(lesson.content);
      setSections(extractedSections);
    }
  }, [lesson?.content]);
  
  // Handle section completion toggling
  const handleToggleSectionCompletion = async (sectionTitle: string) => {
    if (!lessonProgress) return;
    
    try {
      const completedSections = lessonProgress.completed_sections || [];
      let updatedSections: string[];
      
      if (completedSections.includes(sectionTitle)) {
        updatedSections = completedSections.filter(s => s !== sectionTitle);
      } else {
        updatedSections = [...completedSections, sectionTitle];
      }
      
      setIsUpdating(true);
      await updateProgress({ 
        completed: false, // Don't mark lesson as fully completed yet
        sections: updatedSections
      });
      
      toast({
        description: completedSections.includes(sectionTitle) 
          ? "Section marked as incomplete" 
          : "Section marked as complete",
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update section progress',
      });
    } finally {
      setIsUpdating(false);
    }
  };
  
  // Handle marking the entire lesson as complete
  const handleMarkLessonComplete = async () => {
    try {
      setIsUpdating(true);
      await updateProgress({ completed: true });
      
      toast({
        description: "Lesson marked as complete!",
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to mark lesson as complete',
      });
    } finally {
      setIsUpdating(false);
    }
  };
  
  // Navigate to previous/next section
  const goToPreviousSection = () => {
    if (currentSectionIndex > 0) {
      setCurrentSectionIndex(currentSectionIndex - 1);
      window.scrollTo(0, 0);
    }
  };
  
  const goToNextSection = () => {
    if (currentSectionIndex < sections.length - 1) {
      setCurrentSectionIndex(currentSectionIndex + 1);
      window.scrollTo(0, 0);
    }
  };
  
  // Go to specific section by index
  const goToSection = (index: number) => {
    if (index >= 0 && index < sections.length) {
      setCurrentSectionIndex(index);
      window.scrollTo(0, 0);
    }
  };
  
  // Go back to lessons list
  const handleBack = () => {
    navigate('/student/lessons');
  };
  
  // Show loading state
  if (lessonLoading) {
    return (
      <div className="flex justify-center items-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-primary/70" />
      </div>
    );
  }
  
  // Show error state if lesson not found
  if (!lesson) {
    return (
      <div className="text-center py-24">
        <h2 className="text-2xl font-semibold">Lesson Not Found</h2>
        <p className="text-muted-foreground">The requested lesson could not be found.</p>
      </div>
    );
  }
  
  const completedSections = lessonProgress?.completed_sections || [];
  const isLessonComplete = !!lessonProgress?.completed;
  const totalPages = sections.length;
  const isFirstPage = currentSectionIndex === 0;
  const isLastPage = currentSectionIndex === totalPages - 1;
  const completionPercentage = totalPages > 0 
    ? Math.round((currentSectionIndex) / (totalPages - 1) * 100) 
    : 0;
  
  return (
    <div className="container mx-auto py-10">
      <div className="space-y-6">
        <LessonHeader 
          title={lesson.title}
          isCompleted={isLessonComplete}
          onMarkComplete={handleMarkLessonComplete}
          onBack={handleBack}
          isUpdating={isUpdating}
        />
        
        <Separator />
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Sidebar Navigation */}
          <div className="md:col-span-1">
            <LessonNavigation 
              sections={sections}
              currentSectionIndex={currentSectionIndex}
              goToSection={goToSection}
              completedSections={completedSections}
              hasQuiz={!!quiz && quizQuestions.length > 0}
              currentTab={currentTab}
              setCurrentTab={setCurrentTab}
            />
          </div>
          
          {/* Main Content Area */}
          <div className="md:col-span-3">
            {currentTab === 'content' ? (
              <LessonContent 
                introContent=""
                sections={sections}
                currentSectionIndex={currentSectionIndex}
                completedSections={completedSections}
                onToggleComplete={handleToggleSectionCompletion}
                onPrevious={goToPreviousSection}
                onNext={goToNextSection}
                isFirstPage={isFirstPage}
                isLastPage={isLastPage}
                completionPercentage={completionPercentage}
                totalPages={totalPages}
              />
            ) : (
              <QuizSection 
                questions={quizQuestions || []} 
                quizId={quiz?.id || ''}
                lessonId={lessonId}
                title={quiz?.title || 'Lesson Quiz'}
                passPercent={quiz?.pass_percent || 70}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LessonView;
