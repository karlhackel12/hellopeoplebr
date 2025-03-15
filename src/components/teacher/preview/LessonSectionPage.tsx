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
}
const LessonSectionPage: React.FC<LessonSectionPageProps> = ({
  id,
  title,
  content,
  isCompleted,
  onToggleComplete
}) => {
  const isMobile = useIsMobile();
  return <div id={id} className="animate-fade-in">
      <div className={`flex ${isMobile ? 'flex-col space-y-2' : 'items-center justify-between'} mb-4`}>
        <h2 className={`${isMobile ? 'text-lg' : 'text-xl'} font-semibold`}>{title}</h2>
        
      </div>
      
      <div className="prose max-w-none pl-0 pb-8" dangerouslySetInnerHTML={{
      __html: formatMarkdownToHtml(content)
    }} />
    </div>;
};
export default LessonSectionPage;