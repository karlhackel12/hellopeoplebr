
import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface QuizPreviewHeaderProps {
  showPreview: boolean;
  togglePreview: () => void;
}

const QuizPreviewHeader: React.FC<QuizPreviewHeaderProps> = ({ 
  showPreview, 
  togglePreview 
}) => {
  return (
    <CardHeader className="pb-3">
      <div className="flex justify-between items-center">
        <div>
          <CardTitle>Quiz Preview</CardTitle>
          <CardDescription>
            Review your AI-generated quiz before saving
          </CardDescription>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={togglePreview}
          className="h-8 w-8 p-0"
        >
          {showPreview ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </div>
    </CardHeader>
  );
};

export default QuizPreviewHeader;
