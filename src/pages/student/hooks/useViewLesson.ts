import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useLessonData } from './useLessonData';
import { useLessonProgress } from './useLessonProgress';
import { extractSections } from '@/utils/markdownUtils';
import { useToast } from '@/hooks/use-toast';
import { useViewLesson as useViewLessonData } from './lesson/useViewLesson';

export const useViewLesson = () => {
  const { lessonId = '' } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  console.log('useViewLesson: Hook initialized with lessonId:', lessonId);
  
  // Control view mode state
  const [viewMode, setViewMode] = useState<'standard' | 'duolingo'>('standard');
  
  // Fetch lesson data with error handling
  const { 
    lesson, 
    lessonLoading, 
    quiz, 
    quizQuestions,
    hasQuiz,
    isQuizAvailable,
    hasUnpublishedQuiz,
    hasErrors
  } = useLessonData(lessonId);
  
  console.log('useViewLesson: Lesson data status:', {
    lessonLoading,
    hasLesson: !!lesson,
    hasErrors,
    hasQuiz,
    isQuizAvailable
  });
  
  // Track lesson view status
  const { isUpdatingViewStatus } = useViewLessonData(lessonId, lessonLoading);
  
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
      console.log('useViewLesson: Extracting sections from lesson content');
      const extractedSections = extractSections(lesson.content);
      setSections(extractedSections);
      console.log('useViewLesson: Extracted sections:', extractedSections.length);
    } else {
      console.log('useViewLesson: No lesson content to extract sections from');
      setSections([]);
    }
  }, [lesson?.content]);

  // Handle lesson loading errors
  useEffect(() => {
    if (hasErrors && !lessonLoading) {
      console.error('useViewLesson: Lesson loading failed');
      toast({
        variant: 'destructive',
        title: 'Erro ao carregar lição',
        description: 'Não foi possível carregar a lição. Tente novamente.',
      });
    }
  }, [hasErrors, lessonLoading, toast]);

  // Handle section completion toggling
  const handleToggleSectionCompletion = async (sectionTitle: string) => {
    if (!lesson) {
      console.warn('useViewLesson: Attempted to toggle section completion without lesson');
      return;
    }
    
    try {
      console.log('useViewLesson: Toggling section completion:', sectionTitle);
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
      console.error('useViewLesson: Error updating section progress:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update section progress',
      });
    }
  };
  
  // Handle marking the entire lesson as complete
  const handleMarkLessonComplete = async () => {
    if (!lesson) {
      console.warn('useViewLesson: Attempted to mark lesson complete without lesson');
      return;
    }
    
    try {
      console.log('useViewLesson: Marking lesson as complete');
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
      console.error('useViewLesson: Error marking lesson complete:', error);
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
    console.log('useViewLesson: Navigating back to lessons list');
    navigate('/student/lessons');
  };

  // Calculate derived data
  const completedSections = lessonProgress?.completed_sections || [];
  const isLessonComplete = !!lessonProgress?.completed;
  const totalPages = sections.length;
  const isFirstPage = currentSectionIndex === 0;
  const isLastPage = currentSectionIndex === totalPages - 1;
  const completionPercentage = totalPages > 0 
    ? Math.round((currentSectionIndex) / (totalPages - 1) * 100) 
    : 0;

  // Convert quiz questions to Duolingo format
  const convertQuizQuestionsToDuolingoFormat = (quizQuestions: any[]) => {
    console.log('useViewLesson: Converting quiz questions to Duolingo format');
    return quizQuestions.map(q => ({
      id: q.id,
      type: 'multiple_choice' as 'multiple_choice' | 'fill_blank' | 'arrange' | 'listen',
      question: q.question,
      options: q.options,
      correctAnswer: q.correct_answer
    }));
  };
  
  // Check if the format Duolingo should be used
  const shouldUseDuolingoStyle = () => {
    // Check if user has configuration to use Duolingo style
    // or if the specific lesson is marked to use this style
    return true; // Default to enable for all lessons
  };
  
  // Use effect to determine the view mode when loading the lesson
  useEffect(() => {
    if (shouldUseDuolingoStyle()) {
      setViewMode('duolingo');
    }
  }, [lesson]);
  
  const duolingoQuizQuestions = quizQuestions ? convertQuizQuestionsToDuolingoFormat(quizQuestions) : [];

  console.log('useViewLesson: Returning hook data with lesson:', !!lesson);

  return {
    // Lesson data
    lessonId,
    lesson,
    quiz,
    quizQuestions,
    
    // States
    lessonLoading,
    progressLoading,
    isUpdating,
    
    // UI state
    currentTab,
    setCurrentTab,
    currentSectionIndex,
    sections,

    // Navigation
    goToSection,
    goToPreviousSection,
    goToNextSection,
    handleBack,
    
    // Progress
    completedSections,
    isLessonComplete,
    handleToggleSectionCompletion,
    handleMarkLessonComplete,
    
    // Assignment
    assignment,
    
    // Quiz availability
    hasQuiz,
    isQuizAvailable,
    
    // Duolingo specific props
    viewMode,
    setViewMode,
    duolingoQuizQuestions,
    convertQuizQuestionsToDuolingoFormat
  };
};
