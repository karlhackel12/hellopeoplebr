import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Separator } from "@/components/ui/separator";
import { useLessonData } from './hooks/useLessonData';
import { useLessonProgress } from './hooks/useLessonProgress';
import LessonHeader from './components/LessonHeader';
import LessonContainer from './components/lesson/LessonContainer';
import AssignmentAlert from './components/lesson/AssignmentAlert';
import UnpublishedQuizAlert from './components/lesson/UnpublishedQuizAlert';
import LessonLoadingState from './components/lesson/LessonLoadingState';
import LessonErrorState from './components/lesson/LessonErrorState';
import { extractSections } from '@/utils/markdownUtils';
import { useToast } from '@/hooks/use-toast';

const LessonView: React.FC = () => {
  const { lessonId = '' } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Fetch lesson data
  const { 
    lesson, 
    lessonLoading, 
    quiz, 
    quizQuestions,
    hasQuiz,
    isQuizAvailable,
    hasUnpublishedQuiz
  } = useLessonData(lessonId);
  
  // Lesson progress management
  const { 
    lessonProgress, 
    progressLoading,
    assignment,
    updateProgress,
    isUpdating 
  } = useLessonProgress(lessonId);
  
  // UI state
  const [currentTab, setCurrentTab] = useState<'content' | 'quiz'>('content');
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [sections, setSections] = useState<Array<{id: string, title: string, content: string}>>([]);
  
  // Extract sections from lesson content
  useEffect(() => {
    if (lesson?.content) {
      const extractedSections = extractSections(lesson.content);
      setSections(extractedSections);
    }
  }, [lesson?.content]);

  // Debug log
  useEffect(() => {
    console.log('LessonView state:', {
      lessonId,
      hasQuiz,
      isQuizAvailable,
      hasUnpublishedQuiz,
      quizPublished: quiz?.is_published,
      assignmentId: assignment?.id,
      assignmentStatus: assignment?.status
    });
  }, [lessonId, hasQuiz, quiz, assignment]);
  
  // Handle section completion toggling - the only place where sections are toggled
  const handleToggleSectionCompletion = async (sectionTitle: string) => {
    if (!lesson) return;
    
    try {
      const completedSections = lessonProgress?.completed_sections || [];
      let updatedSections: string[];
      
      if (completedSections.includes(sectionTitle)) {
        updatedSections = completedSections.filter(s => s !== sectionTitle);
      } else {
        updatedSections = [...completedSections, sectionTitle];
      }
      
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
    }
  };
  
  // Handle marking the entire lesson as complete - the only place to mark the full lesson complete
  const handleMarkLessonComplete = async () => {
    if (!lesson) return;
    
    try {
      // We'll keep the existing completed sections
      const completedSections = lessonProgress?.completed_sections || [];
      
      await updateProgress({ 
        completed: true, 
        sections: completedSections 
      });
      
      toast({
        description: "Lesson marked as complete!",
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to mark lesson as complete',
      });
    }
  };
  
  // Navigation functions
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
  
  const goToSection = (index: number) => {
    if (index >= 0 && index < sections.length) {
      setCurrentSectionIndex(index);
      window.scrollTo(0, 0);
    }
  };
  
  const handleBack = () => {
    navigate('/student/lessons');
  };
  
  // Show loading state
  if (lessonLoading || progressLoading) {
    return <LessonLoadingState />;
  }
  
  // Show error state if lesson not found
  if (!lesson) {
    return <LessonErrorState />;
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

        <AssignmentAlert assignment={assignment} />
        
        <UnpublishedQuizAlert hasUnpublishedQuiz={hasUnpublishedQuiz} />
        
        <LessonContainer 
          currentTab={currentTab}
          setCurrentTab={setCurrentTab}
          sections={sections}
          currentSectionIndex={currentSectionIndex}
          completedSections={completedSections}
          goToSection={goToSection}
          onToggleSectionCompletion={handleToggleSectionCompletion}
          goToPreviousSection={goToPreviousSection}
          goToNextSection={goToNextSection}
          isFirstPage={isFirstPage}
          isLastPage={isLastPage}
          completionPercentage={completionPercentage}
          totalPages={totalPages}
          hasQuiz={isQuizAvailable}
          quizQuestions={quizQuestions || []}
          quizId={quiz?.id || ''}
          lessonId={lessonId}
          quizTitle={quiz?.title || 'Lesson Quiz'}
          quizPassPercent={quiz?.pass_percent || 70}
        />
      </div>
    </div>
  );
};

export default LessonView;
