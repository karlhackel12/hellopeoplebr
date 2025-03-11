
import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ProgressTracker from './ProgressTracker';

interface LessonContentTabProps {
  content: string;
  completedSections: string[];
  toggleSectionCompletion: (section: string) => void;
}

const LessonContentTab: React.FC<LessonContentTabProps> = ({ 
  content, 
  completedSections, 
  toggleSectionCompletion 
}) => {
  
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

  useEffect(() => {
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
    
    addSectionButtons();
  }, [content, completedSections, toggleSectionCompletion]);

  return (
    <Card className="border-0 shadow-none">
      <CardHeader className="px-0 pt-0">
        <CardTitle className="text-xl">Lesson Content</CardTitle>
      </CardHeader>
      <CardContent className="px-0 prose max-w-none">
        <div 
          dangerouslySetInnerHTML={{ __html: formatMarkdownToHtml(content) }} 
          className="media-content lesson-content"
        />
        
        <ProgressTracker completedSections={completedSections} />
      </CardContent>
    </Card>
  );
};

export default LessonContentTab;
