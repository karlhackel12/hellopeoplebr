
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { FileText, Sparkles } from 'lucide-react';

interface LessonTypeSelectorProps {
  selectedType: 'manual' | 'ai';
  onSelectType: (type: 'manual' | 'ai') => void;
}

const LessonTypeSelector: React.FC<LessonTypeSelectorProps> = ({
  selectedType,
  onSelectType,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card 
        className={`cursor-pointer hover:border-primary transition-all ${
          selectedType === 'manual' ? 'border-primary border-2' : ''
        }`}
        onClick={() => onSelectType('manual')}
      >
        <CardContent className="p-6 flex flex-col items-center text-center">
          <FileText className="h-12 w-12 mb-4 text-primary" />
          <h3 className="text-lg font-semibold mb-2">Create Manually</h3>
          <p className="text-sm text-muted-foreground">
            Build your lesson from scratch with complete control over the content and structure.
          </p>
        </CardContent>
      </Card>

      <Card 
        className={`cursor-pointer hover:border-primary transition-all ${
          selectedType === 'ai' ? 'border-primary border-2' : ''
        }`}
        onClick={() => onSelectType('ai')}
      >
        <CardContent className="p-6 flex flex-col items-center text-center">
          <Sparkles className="h-12 w-12 mb-4 text-primary" />
          <h3 className="text-lg font-semibold mb-2">Generate with AI</h3>
          <p className="text-sm text-muted-foreground">
            Use AI to quickly create lesson content based on your title and parameters.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default LessonTypeSelector;
