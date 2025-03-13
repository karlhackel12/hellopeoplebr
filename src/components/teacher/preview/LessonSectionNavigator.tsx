
import React from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';

interface LessonSectionNavigatorProps {
  sections: Array<{id: string, title: string}>;
  completedSections: string[];
  onSectionClick: (sectionId: string) => void;
}

const LessonSectionNavigator: React.FC<LessonSectionNavigatorProps> = ({
  sections,
  completedSections,
  onSectionClick
}) => {
  if (sections.length === 0) return null;

  return (
    <div className="space-y-2 mb-6">
      <div className="text-sm text-muted-foreground mb-2">
        Navigate through sections:
      </div>
      <div className="flex flex-wrap gap-2">
        {sections.map(section => (
          <Button 
            key={section.id}
            variant={completedSections.includes(section.title) ? "default" : "outline"}
            size="sm"
            className="flex items-center gap-1"
            onClick={() => onSectionClick(section.id)}
          >
            {completedSections.includes(section.title) && (
              <CheckCircle className="h-3 w-3 mr-1" />
            )}
            {section.title}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default LessonSectionNavigator;
