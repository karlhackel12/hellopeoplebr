
import React from 'react';
import { Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface AdvancedOptionsPopoverProps {
  optimizeContent: boolean;
  setOptimizeContent: (checked: boolean) => void;
  questionDifficulty: string;
  setQuestionDifficulty: (value: string) => void;
  showAdvancedOptions: boolean;
  setShowAdvancedOptions: (show: boolean) => void;
  disabled?: boolean;
}

const AdvancedOptionsPopover: React.FC<AdvancedOptionsPopoverProps> = ({
  optimizeContent,
  setOptimizeContent,
  questionDifficulty,
  setQuestionDifficulty,
  showAdvancedOptions,
  setShowAdvancedOptions,
  disabled = false
}) => {
  return (
    <Popover open={showAdvancedOptions} onOpenChange={setShowAdvancedOptions}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1" disabled={disabled}>
          <Settings className="h-3.5 w-3.5" />
          Options
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-3">
          <h4 className="font-medium">Advanced Options</h4>
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="optimize" 
              checked={optimizeContent} 
              onCheckedChange={(checked) => setOptimizeContent(!!checked)}
            />
            <Label htmlFor="optimize" className="text-sm">Optimize long content for better questions</Label>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="difficulty" className="text-sm">Question Difficulty</Label>
            <Select
              value={questionDifficulty}
              onValueChange={setQuestionDifficulty}
            >
              <SelectTrigger id="difficulty">
                <SelectValue placeholder="Balanced" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="easy">Easier Questions</SelectItem>
                <SelectItem value="balanced">Balanced</SelectItem>
                <SelectItem value="challenging">More Challenging</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default AdvancedOptionsPopover;
