
import React from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';

interface MediaHeaderProps {
  showUploader: boolean;
  onToggleUploader: () => void;
}

const MediaHeader: React.FC<MediaHeaderProps> = ({ showUploader, onToggleUploader }) => {
  return (
    <div className="flex justify-between items-center">
      <h2 className="text-2xl font-semibold">Media Attachments</h2>
      <Button 
        onClick={onToggleUploader} 
        className="gap-2"
      >
        <PlusCircle className="h-4 w-4" />
        {showUploader ? 'Hide Uploader' : 'Add Media'}
      </Button>
    </div>
  );
};

export default MediaHeader;
