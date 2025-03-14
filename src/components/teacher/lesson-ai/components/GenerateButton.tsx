
import React from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';

interface GenerateButtonProps {
  generating: boolean;
  isLoading: boolean;
  isFormInvalid: boolean;
}

const GenerateButton: React.FC<GenerateButtonProps> = ({ 
  generating, 
  isLoading, 
  isFormInvalid 
}) => {
  return (
    <div className="pt-4">
      <Button 
        type="submit" 
        disabled={generating || isLoading || isFormInvalid}
        className="w-full"
      >
        <Sparkles className="mr-2 h-4 w-4" /> 
        {generating ? 'Generating...' : 'Generate English Lesson Content'}
      </Button>
    </div>
  );
};

export default GenerateButton;
