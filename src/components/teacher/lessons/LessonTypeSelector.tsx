
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Pencil, Sparkles } from 'lucide-react';

interface LessonTypeSelectorProps {
  selectedType: 'manual' | 'ai';
  onSelectType: (type: 'manual' | 'ai') => void;
}

const LessonTypeSelector: React.FC<LessonTypeSelectorProps> = ({ 
  selectedType, 
  onSelectType 
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card 
        className={`cursor-pointer hover:bg-muted/50 transition-colors ${
          selectedType === 'manual' ? 'border-primary bg-muted/30' : ''
        }`}
        onClick={() => onSelectType('manual')}
      >
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2">
            <Pencil className="h-5 w-5" />
            <span>Manual Creation</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription>
            Create the lesson content yourself using our rich text editor.
          </CardDescription>
        </CardContent>
      </Card>
      
      <Card 
        className={`cursor-pointer hover:bg-muted/50 transition-colors ${
          selectedType === 'ai' ? 'border-primary bg-muted/30' : ''
        }`}
        onClick={() => onSelectType('ai')}
      >
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            <span>AI Assistance</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription>
            Let our AI help you generate lesson content based on your specifications.
          </CardDescription>
        </CardContent>
      </Card>
    </div>
  );
};

export default LessonTypeSelector;
