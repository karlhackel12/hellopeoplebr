
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import MediaUploader from '../../MediaUploader';
import MediaHeader from './MediaHeader';
import MediaGrid from './MediaGrid';
import useMediaFetch from './useMediaFetch';
import { toast } from 'sonner';

interface MediaAttachmentsTabProps {
  lessonId?: string;
  isEditMode: boolean;
}

const MediaAttachmentsTab: React.FC<MediaAttachmentsTabProps> = ({ lessonId, isEditMode }) => {
  const [showUploader, setShowUploader] = useState(false);
  const { media, loading, fetchMedia } = useMediaFetch(lessonId);

  // This function will be triggered when media is added or deleted
  const handleMediaUpdated = () => {
    fetchMedia();
    toast.success('Media updated successfully');
  };

  const toggleUploader = () => setShowUploader(!showUploader);

  if (!isEditMode || !lessonId) {
    return (
      <div className="p-8 text-center border rounded-md bg-muted">
        <p>Save the lesson first before adding media attachments</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <MediaHeader 
        showUploader={showUploader} 
        onToggleUploader={toggleUploader} 
      />

      {showUploader && (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <MediaUploader 
              lessonId={lessonId} 
              onMediaUpdated={handleMediaUpdated} 
              onCancel={() => setShowUploader(false)}
            />
          </CardContent>
        </Card>
      )}

      {!showUploader && (
        <MediaGrid 
          media={media}
          loading={loading}
          onMediaUpdated={handleMediaUpdated}
          onAddMedia={() => setShowUploader(true)}
        />
      )}
    </div>
  );
};

export default MediaAttachmentsTab;
