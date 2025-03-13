
import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ContentDisplayProps {
  content: string;
  error?: string | null;
}

const ContentDisplay: React.FC<ContentDisplayProps> = ({ content, error }) => {
  if (error) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {error}
        </AlertDescription>
      </Alert>
    );
  }
  
  if (!content || content.trim() === '') {
    return (
      <div className="border rounded-md p-4 bg-muted text-center">
        <p>No content generated yet.</p>
      </div>
    );
  }
  
  return (
    <div className="border rounded-md p-4 max-h-[500px] overflow-y-auto">
      <div 
        className="prose max-w-none" 
        dangerouslySetInnerHTML={{ 
          __html: content
            .replace(/\n/g, '<br/>')
            .replace(/```json/g, '')
            .replace(/```/g, '')
        }} 
      />
    </div>
  );
};

export default ContentDisplay;
