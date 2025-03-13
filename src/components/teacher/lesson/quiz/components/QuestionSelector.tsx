
import React from 'react';
import { InfoIcon } from 'lucide-react';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface QuestionSelectorProps {
  numQuestions: string;
  setNumQuestions: (value: string) => void;
  disabled?: boolean;
}

const QuestionSelector: React.FC<QuestionSelectorProps> = ({
  numQuestions,
  setNumQuestions,
  disabled = false
}) => {
  return (
    <div className="flex items-center gap-2">
      <Label htmlFor="num-questions">Number of Questions:</Label>
      <Select
        value={numQuestions}
        onValueChange={setNumQuestions}
        disabled={disabled}
      >
        <SelectTrigger id="num-questions" className="w-24">
          <SelectValue placeholder="5" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="3">3</SelectItem>
          <SelectItem value="5">5</SelectItem>
          <SelectItem value="7">7</SelectItem>
          <SelectItem value="10">10</SelectItem>
        </SelectContent>
      </Select>
      
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="text-muted-foreground cursor-help">
              <InfoIcon className="h-4 w-4" />
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p className="max-w-xs">The number of multiple-choice questions to generate. Choose fewer questions for shorter lessons.</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

export default QuestionSelector;
