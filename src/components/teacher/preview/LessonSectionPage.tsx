
import React from 'react';
import { CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatMarkdownToHtml } from '@/utils/markdownUtils';

interface LessonSectionPageProps {
  id: string;
  title: string;
  content: string;
  isCompleted: boolean;
  onToggleComplete: () => void;
}

const LessonSectionPage: React.FC<LessonSectionPageProps> = ({
  id,
  title,
  content,
  isCompleted,
  onToggleComplete,
}) => {
  return (
    <div id={id} className="animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">{title}</h2>
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
          onClick={onToggleComplete}
        >
          <CheckCircle 
            className={`h-4 w-4 ${
              isCompleted 
                ? 'text-green-500 fill-green-500' 
                : 'text-muted-foreground'
            }`} 
          />
          {isCompleted ? 'Completed' : 'Mark Complete'}
        </Button>
      </div>
      
      <div 
        className="prose max-w-none pl-0 pb-8" 
        dangerouslySetInnerHTML={{ __html: formatMarkdownToHtml(content) }} 
      />
    </div>
  );
};

export default LessonSectionPage;
