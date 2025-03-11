import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Smartphone, Monitor, Bookmark, Book, BookOpen, CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Question } from './quiz/types';
import QuizPreview from './quiz/QuizPreview';
import { Badge } from '@/components/ui/badge';

interface LessonPreviewProps {
  content: string;
  title?: string;
  lessonId?: string;
}

export const LessonPreview: React.FC<LessonPreviewProps> = ({ content, title, lessonId }) => {
  const [viewMode, setViewMode] = React.useState<'desktop' | 'mobile'>('desktop');
  const [completedSections, setCompletedSections] = React.useState<string[]>([]);
  const [quizQuestions, setQuizQuestions] = useState<Question[]>([]);
  const [quizTitle, setQuizTitle] = useState<string>('Lesson Quiz');
  const [quizPassPercent, setQuizPassPercent] = useState<number>(70);
  const [loadingQuiz, setLoadingQuiz] = useState<boolean>(false);
  const [quizExists, setQuizExists] = useState<boolean>(false);
  const [isQuizPublished, setIsQuizPublished] = useState<boolean>(false);
  
  const toggleSectionCompletion = (section: string) => {
    if (completedSections.includes(section)) {
      setCompletedSections(completedSections.filter(s => s !== section));
    } else {
      setCompletedSections([...completedSections, section]);
    }
  };

  // Fetch quiz data if lessonId is provided
  useEffect(() => {
    const fetchQuizData = async () => {
      if (!lessonId) return;
      
      try {
        setLoadingQuiz(true);
        
        // First check if there's a quiz for this lesson
        const { data: quiz, error: quizError } = await supabase
          .from('quizzes')
          .select('id, title, pass_percent, is_published')
          .eq('lesson_id', lessonId)
          .maybeSingle();
        
        if (quizError) {
          console.error('Error fetching quiz:', quizError);
          return;
        }
        
        if (!quiz) {
          setQuizExists(false);
          return;
        }
        
        setQuizExists(true);
        setQuizTitle(quiz.title);
        setQuizPassPercent(quiz.pass_percent);
        setIsQuizPublished(quiz.is_published);
        
        // Fetch questions for this quiz
        const { data: questions, error: questionsError } = await supabase
          .from('quiz_questions')
          .select(`
            *,
            options:quiz_question_options(*)
          `)
          .eq('quiz_id', quiz.id)
          .order('order_index');
        
        if (questionsError) {
          console.error('Error fetching quiz questions:', questionsError);
          return;
        }
        
        setQuizQuestions(questions || []);
      } catch (error) {
        console.error('Error in quiz data fetch:', error);
      } finally {
        setLoadingQuiz(false);
      }
    };
    
    fetchQuizData();
  }, [lessonId]);

  const formatMarkdownToHtml = (markdown: string): string => {
    // Simple markdown to HTML conversion
    let html = markdown
      .replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold mb-4">$1</h1>')
      .replace(/^## (.*$)/gm, '<h2 class="text-xl font-semibold my-3 flex items-center justify-between"><span>$1</span></h2>')
      .replace(/^### (.*$)/gm, '<h3 class="text-lg font-semibold my-2">$1</h3>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/^- (.*$)/gm, '<li class="ml-6 list-disc my-1">$1</li>')
      .replace(/^([0-9]+)\. (.*$)/gm, '<li class="ml-6 list-decimal my-1">$2</li>')
      .replace(/!\[(.*?)\]\((.*?)\)/g, '<img src="$2" alt="$1" class="my-2 max-w-full rounded" />')
      .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline">$1</a>')
      .replace(/\n\n/g, '<br/><br/>');
    
    // Wrap lists in ul tags
    html = html.replace(/<li class="ml-6 list-disc my-1">(.*?)<\/li>/g, (match, content) => {
      return `<ul class="my-2">${match}</ul>`;
    }).replace(/<\/ul><ul class="my-2">/g, '');
    
    // Add interactive elements for sections
    const sections = ['Description', 'Learning Objectives', 'Practical Situations', 'Key Phrases', 'Vocabulary', 'Explanations', 'Tips'];
    
    sections.forEach(section => {
      const sectionRegex = new RegExp(`<h2 class="text-xl font-semibold my-3 flex items-center justify-between"><span>${section}</span></h2>`, 'g');
      html = html.replace(sectionRegex, `<h2 class="text-xl font-semibold my-3 flex items-center justify-between"><span>${section}</span><button class="section-complete-btn" data-section="${section}" aria-label="Mark section as complete"></button></h2>`);
    });
    
    // Add audio player for vocabulary words
    html = html.replace(/<strong>(.*?)<\/strong> \((.*?)\) - (.*?)<\/li>/g, 
      '<strong>$1</strong> <span class="text-sm text-muted-foreground">($2)</span> - $3 <button class="text-primary text-xs ml-2 audio-btn" data-word="$1" aria-label="Listen to pronunciation">Listen</button></li>');
    
    return html;
  };

  React.useEffect(() => {
    // Add event listeners after the content is rendered
    const addSectionButtons = () => {
      document.querySelectorAll('.section-complete-btn').forEach(button => {
        button.addEventListener('click', (e) => {
          e.preventDefault();
          const section = (button as HTMLElement).dataset.section as string;
          toggleSectionCompletion(section);
          
          if (completedSections.includes(section)) {
            (button as HTMLElement).innerHTML = '';
          } else {
            (button as HTMLElement).innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-green-500"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>';
          }
        });
      });
    };
    
    addSectionButtons();
    
    // Add event listeners for audio buttons
    document.querySelectorAll('.audio-btn').forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        const word = (button as HTMLElement).dataset.word;
        if (word) {
          // Simulate text-to-speech
          alert(`Playing pronunciation for: ${word}`);
        }
      });
    });
  }, [content, completedSections]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium flex items-center">
          <BookOpen className="h-4 w-4 mr-2" />
          Student Preview
        </h3>
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant={viewMode === 'desktop' ? 'default' : 'outline'}
            onClick={() => setViewMode('desktop')}
          >
            <Monitor className="h-4 w-4 mr-1" /> Desktop
          </Button>
          <Button
            size="sm"
            variant={viewMode === 'mobile' ? 'default' : 'outline'}
            onClick={() => setViewMode('mobile')}
          >
            <Smartphone className="h-4 w-4 mr-1" /> Mobile
          </Button>
        </div>
      </div>

      <div className={`border rounded-lg overflow-hidden bg-white ${
        viewMode === 'mobile' ? 'max-w-[375px] mx-auto' : 'w-full'
      }`}>
        <div className="bg-primary text-white p-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="font-bold">{title || 'Student Portal'}</h2>
            </div>
            <Button size="sm" variant="outline" className="bg-white/20 text-white border-white/20">
              <Bookmark className="h-4 w-4 mr-1" /> Save
            </Button>
          </div>
        </div>
        
        <div className="p-4">
          <Tabs defaultValue="content">
            <TabsList className="w-full grid grid-cols-3 mb-4">
              <TabsTrigger value="content">
                <Book className="h-4 w-4 mr-1" /> Lesson
              </TabsTrigger>
              <TabsTrigger value="practice">Exercises</TabsTrigger>
              <TabsTrigger value="quiz">Quiz</TabsTrigger>
            </TabsList>
            
            <TabsContent value="content" className="mt-0">
              <Card className="border-0 shadow-none">
                <CardHeader className="px-0 pt-0">
                  <CardTitle className="text-xl">Lesson Content</CardTitle>
                </CardHeader>
                <CardContent className="px-0 prose max-w-none">
                  <div 
                    dangerouslySetInnerHTML={{ __html: formatMarkdownToHtml(content) }} 
                    className="media-content lesson-content"
                  />
                  
                  <div className="mt-8 border-t pt-4">
                    <h3 className="text-lg font-medium mb-4 flex items-center">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Progress
                    </h3>
                    <div className="bg-muted rounded-full h-2 mb-2">
                      <div 
                        className="bg-primary h-2 rounded-full" 
                        style={{ width: `${completedSections.length * 14.3}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {completedSections.length} of 7 sections completed
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="practice" className="mt-0">
              <div className="text-center py-8">
                <p className="text-muted-foreground">Practice exercises will be available after you save the lesson</p>
              </div>
            </TabsContent>
            
            <TabsContent value="quiz" className="mt-0">
              {!lessonId ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Quiz will be available after you save the lesson</p>
                </div>
              ) : loadingQuiz ? (
                <div className="text-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                  <p className="text-muted-foreground">Loading quiz data...</p>
                </div>
              ) : !quizExists ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No quiz has been created for this lesson yet</p>
                </div>
              ) : quizQuestions.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">This lesson has a quiz, but no questions have been added yet</p>
                </div>
              ) : (
                <div>
                  {!isQuizPublished && (
                    <div className="mb-4 p-2 bg-amber-50 border border-amber-200 rounded-md flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-amber-600" />
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200">
                          Draft
                        </Badge>
                        <p className="text-sm text-amber-700">
                          This quiz is in draft mode and would not be visible to students until published
                        </p>
                      </div>
                    </div>
                  )}
                  <QuizPreview 
                    questions={quizQuestions} 
                    title={quizTitle}
                    passPercent={quizPassPercent}
                    isPreview={true}
                  />
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <div className="text-sm text-muted-foreground">
        <p>This is a preview of how your lesson will appear to students. Save the lesson to enable exercises and quiz features.</p>
      </div>
    </div>
  );
};
