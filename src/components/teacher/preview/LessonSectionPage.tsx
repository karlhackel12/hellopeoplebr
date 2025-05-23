
import React from 'react';
import { CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatMarkdownToHtml } from '@/utils/markdownUtils';
import { useIsMobile } from '@/hooks/use-mobile';

interface LessonSectionPageProps {
  id: string;
  title: string;
  content: string;
  isCompleted: boolean;
  onToggleComplete: () => void;
  showToggle?: boolean;
}

const LessonSectionPage: React.FC<LessonSectionPageProps> = ({
  id,
  title,
  content,
  isCompleted,
  onToggleComplete,
  showToggle = true
}) => {
  const isMobile = useIsMobile();
  
  return (
    <div id={id} className="animate-fade-in">
      <div className={`flex ${isMobile ? 'flex-col space-y-2' : 'items-center justify-between'} mb-4`}>
        <h2 className={`${isMobile ? 'text-lg' : 'text-xl'} font-semibold`}>{title}</h2>
        {showToggle && (
          <Button
            variant="ghost"
            size={isMobile ? "sm" : "sm"}
            className={`flex items-center gap-2 ${isMobile ? 'self-start' : ''}`}
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
        )}
      </div>
      
      <div 
        className="prose max-w-none pl-0 pb-8" 
        dangerouslySetInnerHTML={{ __html: formatMarkdownToHtml(content) }} 
      />
    </div>
  );
};

export default LessonSectionPage;
