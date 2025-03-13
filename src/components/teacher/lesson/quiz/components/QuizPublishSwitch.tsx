
import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface QuizPublishSwitchProps {
  isPublished: boolean;
  onTogglePublish: () => Promise<void>;
  saving: boolean;
}

const QuizPublishSwitch: React.FC<QuizPublishSwitchProps> = ({
  isPublished,
  onTogglePublish,
  saving
}) => {
  const [localSaving, setLocalSaving] = useState(false);
  
  const handleTogglePublish = async () => {
    try {
      setLocalSaving(true);
      await onTogglePublish();
    } catch (error) {
      console.error("Error toggling publish status:", error);
      toast.error("Error changing publish status", {
        description: "An unexpected error occurred",
      });
    } finally {
      setLocalSaving(false);
    }
  };

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
        {(saving || localSaving) ? (
          <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
        ) : null}
        <Label htmlFor="publish-toggle" className="text-sm">
          {isPublished ? "Published" : "Draft"}
        </Label>
        <Switch 
          id="publish-toggle" 
          checked={isPublished} 
          onCheckedChange={handleTogglePublish}
          disabled={saving || localSaving}
        />
      </div>
    </div>
  );
};

export default QuizPublishSwitch;
