
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, Edit } from 'lucide-react';

interface ContentHeaderProps {
  editMode: boolean;
  toggleEditMode: () => void;
  contentSource: string;
}

const ContentHeader: React.FC<ContentHeaderProps> = ({ 
  editMode, 
  toggleEditMode,
  contentSource
}) => {
  return (
    <div className="flex justify-between items-center">
      <Badge variant="outline" className="px-2 py-1">
        AI Generated {contentSource === 'mixed' && '(Edited)'}
      </Badge>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={toggleEditMode}
      >
        {editMode ? (
          <>
            <Check className="mr-1 h-4 w-4" /> Done Editing
          </>
        ) : (
          <>
            <Edit className="mr-1 h-4 w-4" /> Edit Content
          </>
        )}
      </Button>
    </div>
  );
};

export default ContentHeader;
