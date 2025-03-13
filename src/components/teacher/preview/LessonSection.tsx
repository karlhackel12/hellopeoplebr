
import React from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { formatMarkdownToHtml } from '@/utils/markdownUtils';

interface LessonSectionProps {
  id: string;
  title: string;
  content: string;
  isExpanded: boolean;
  isCompleted: boolean;
  onToggleExpand: () => void;
  onToggleComplete: () => void;
}

const LessonSection: React.FC<LessonSectionProps> = ({
  id,
  title,
  content,
  isExpanded,
  isCompleted,
  onToggleExpand,
  onToggleComplete,
}) => {
  return (
    <div id={id} className="pt-4 pb-2">
      <div 
        className="flex items-center justify-between cursor-pointer mb-2" 
        onClick={onToggleExpand}
      >
        <h2 className="text-xl font-semibold my-3 flex items-center">
          <span>{title}</span>
        </h2>
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 rounded-full mr-2"
            onClick={(e) => {
              e.stopPropagation();
              onToggleComplete();
            }}
          >
            <CheckCircle 
              className={`h-5 w-5 ${
                isCompleted 
                  ? 'text-green-500 fill-green-500' 
                  : 'text-muted-foreground'
              }`} 
            />
          </Button>
          {isExpanded ? (
            <ChevronUp className="h-5 w-5 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-5 w-5 text-muted-foreground" />
          )}
        </div>
      </div>
      
      {isExpanded && (
        <div 
          className="prose max-w-none pl-4 transition-all duration-200 pb-4" 
          dangerouslySetInnerHTML={{ __html: formatMarkdownToHtml(content) }} 
        />
      )}
    </div>
  );
};

export default LessonSection;
