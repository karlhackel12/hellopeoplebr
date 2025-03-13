
import React from 'react';
import { Button } from '@/components/ui/button';
import MediaItem from './MediaItem';

interface MediaGridProps {
  media: any[];
  loading: boolean;
  onAddMedia: () => void;
  onMediaUpdated: () => void;
}

const MediaGrid: React.FC<MediaGridProps> = ({ 
  media, 
  loading, 
  onAddMedia, 
  onMediaUpdated 
}) => {
  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <p>Loading media...</p>
      </div>
    );
  }
  
  if (media.length === 0) {
    return (
      <div className="text-center py-12 border rounded-md bg-muted">
        <p className="text-muted-foreground">No media attachments yet</p>
        <Button 
          variant="outline" 
          onClick={onAddMedia} 
          className="mt-4"
        >
          Add your first media
        </Button>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {media.map((item) => (
        <MediaItem 
          key={item.id} 
          media={item} 
          onMediaUpdated={onMediaUpdated}
        />
      ))}
    </div>
  );
};

export default MediaGrid;
