
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ProgressTracker from './ProgressTracker';
import { ChevronDown, ChevronUp, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [sectionData, setSectionData] = useState<{id: string, title: string, content: string}[]>([]);
  
  // Parse content into sections on mount
  useEffect(() => {
    const sections = extractSections(content);
    setSectionData(sections);
    
    // Initially expand all sections
    const initialExpandState: Record<string, boolean> = {};
    sections.forEach(section => {
      initialExpandState[section.id] = true;
    });
    setExpandedSections(initialExpandState);
  }, [content]);
  
  const extractSections = (markdown: string): {id: string, title: string, content: string}[] => {
    const sections: {id: string, title: string, content: string}[] = [];
    const sectionRegex = /## (.*?)\n([\s\S]*?)(?=\n## |$)/g;
    
    let match;
    while ((match = sectionRegex.exec(markdown)) !== null) {
      const title = match[1].trim();
      const content = match[2].trim();
      const id = title.toLowerCase().replace(/[^\w]+/g, '-');
      
      sections.push({
        id,
        title,
        content
      });
    }
    
    return sections;
  };
  
  const formatMarkdownToHtml = (markdown: string): string => {
    // Simple markdown to HTML conversion, excluding H2 headings which we handle separately
    let html = markdown
      .replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold mb-4">$1</h1>')
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
    
    // Add audio player for vocabulary words
    html = html.replace(/<strong>(.*?)<\/strong> \((.*?)\) - (.*?)<\/li>/g, 
      '<strong>$1</strong> <span class="text-sm text-muted-foreground">($2)</span> - $3 <button class="text-primary text-xs ml-2 audio-btn" data-word="$1" aria-label="Listen to pronunciation">Listen</button></li>');
    
    return html;
  };

  const toggleSectionExpand = (sectionId: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  useEffect(() => {
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
  }, [sectionData, expandedSections]);

  return (
    <Card className="border-0 shadow-none">
      <CardHeader className="px-0 pt-0">
        <CardTitle className="text-xl">Lesson Content</CardTitle>
      </CardHeader>
      <CardContent className="px-0 space-y-4">
        {/* Introduction content (anything before first section) */}
        <div className="prose max-w-none mb-6">
          {content.split('## ')[0] && (
            <div dangerouslySetInnerHTML={{ 
              __html: formatMarkdownToHtml(content.split('## ')[0]) 
            }} />
          )}
        </div>
        
        {/* Section navigator */}
        <div className="space-y-2 mb-6">
          {sectionData.length > 0 && (
            <div className="text-sm text-muted-foreground mb-2">
              Navigate through sections:
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            {sectionData.map(section => (
              <Button 
                key={section.id}
                variant={completedSections.includes(section.title) ? "default" : "outline"}
                size="sm"
                className="flex items-center gap-1"
                onClick={() => {
                  // Expand the section
                  setExpandedSections({...expandedSections, [section.id]: true});
                  // Scroll to the section
                  document.getElementById(section.id)?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                  });
                }}
              >
                {completedSections.includes(section.title) && (
                  <CheckCircle className="h-3 w-3 mr-1" />
                )}
                {section.title}
              </Button>
            ))}
          </div>
        </div>
        
        {/* Sections content */}
        <div className="divide-y">
          {sectionData.map(section => (
            <div 
              key={section.id} 
              id={section.id}
              className="pt-4 pb-2"
            >
              <div 
                className="flex items-center justify-between cursor-pointer mb-2" 
                onClick={() => toggleSectionExpand(section.id)}
              >
                <h2 className="text-xl font-semibold my-3 flex items-center">
                  <span>{section.title}</span>
                </h2>
                <div className="flex items-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 rounded-full mr-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSectionCompletion(section.title);
                    }}
                  >
                    <CheckCircle 
                      className={`h-5 w-5 ${
                        completedSections.includes(section.title) 
                          ? 'text-green-500 fill-green-500' 
                          : 'text-muted-foreground'
                      }`} 
                    />
                  </Button>
                  {expandedSections[section.id] ? (
                    <ChevronUp className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
              </div>
              
              {expandedSections[section.id] && (
                <div 
                  className="prose max-w-none pl-4 transition-all duration-200 pb-4" 
                  dangerouslySetInnerHTML={{ __html: formatMarkdownToHtml(section.content) }} 
                />
              )}
            </div>
          ))}
        </div>
        
        <ProgressTracker 
          completedSections={completedSections} 
          totalSections={sectionData.length}
          className="mt-8"
        />
      </CardContent>
    </Card>
  );
};

export default LessonContentTab;
