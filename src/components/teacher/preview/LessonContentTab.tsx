
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ProgressTracker from './ProgressTracker';
import LessonSectionNavigator from './LessonSectionNavigator';
import LessonSection from './LessonSection';
import { extractSections } from '@/utils/markdownUtils';

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

  const handleSectionClick = (sectionId: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: true
    }));
    document.getElementById(sectionId)?.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
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
        
        <LessonSectionNavigator 
          sections={sectionData}
          completedSections={completedSections}
          onSectionClick={handleSectionClick}
        />
        
        {/* Sections content */}
        <div className="divide-y">
          {sectionData.map(section => (
            <LessonSection
              key={section.id}
              id={section.id}
              title={section.title}
              content={section.content}
              isExpanded={expandedSections[section.id]}
              isCompleted={completedSections.includes(section.title)}
              onToggleExpand={() => {
                setExpandedSections(prev => ({
                  ...prev,
                  [section.id]: !prev[section.id]
                }));
              }}
              onToggleComplete={() => toggleSectionCompletion(section.title)}
            />
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
