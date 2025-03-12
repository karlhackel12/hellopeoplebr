
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface QuizPublishSwitchProps {
  isPublished: boolean;
  onTogglePublish: () => Promise<boolean> | Promise<void>;
  saving: boolean;
}

const QuizPublishSwitch: React.FC<QuizPublishSwitchProps> = ({
  isPublished,
  onTogglePublish,
  saving
}) => {
  return (
    <div className="px-6 py-2 border-b flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Badge variant={isPublished ? "default" : "outline"}>
          {isPublished ? "Published" : "Draft"}
        </Badge>
        <p className="text-sm text-muted-foreground">
          {isPublished 
            ? "This quiz is visible to students" 
            : "This quiz is only visible to teachers"}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Label htmlFor="publish-toggle" className="text-sm">
          {isPublished ? "Published" : "Draft"}
        </Label>
        <Switch 
          id="publish-toggle" 
          checked={isPublished} 
          onCheckedChange={onTogglePublish}
          disabled={saving}
        />
      </div>
    </div>
  );
};

export default QuizPublishSwitch;
