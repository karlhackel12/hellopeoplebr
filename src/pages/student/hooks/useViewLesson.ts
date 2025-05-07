import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useLessonData } from './useLessonData';
import { useLessonProgress } from './useLessonProgress';
import { extractSections } from '@/utils/markdownUtils';
import { useToast } from '@/hooks/use-toast';

export const useViewLesson = () => {
  const { lessonId = '' } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Adicione este estado para controlar o modo de visualização
  const [viewMode, setViewMode] = useState<'standard' | 'duolingo'>('standard');
  
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

  // Handle section completion toggling
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
  
  // Handle marking the entire lesson as complete
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
    return quizQuestions.map(q => ({
      id: q.id,
      type: 'multiple_choice' as 'multiple_choice' | 'fill_blank' | 'arrange' | 'listen',
      question: q.question,
      options: q.options,
      correctAnswer: q.correct_answer
    }));
  };
  
  // Adicione função para verificar se o formato Duolingo deve ser usado
  const shouldUseDuolingoStyle = () => {
    // Verificar se o usuário tem configuração para usar estilo Duolingo
    // ou se a lição específica está marcada para usar este estilo
    return true; // Por padrão, ative para todas as lições
  };
  
  // Use efeito para determinar o modo de visualização ao carregar a lição
  useEffect(() => {
    if (shouldUseDuolingoStyle()) {
      setViewMode('duolingo');
    }
  }, [lesson]);
  
  const duolingoQuizQuestions = quizQuestions ? convertQuizQuestionsToDuolingoFormat(quizQuestions) : [];

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