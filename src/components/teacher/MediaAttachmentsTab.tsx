
import React from 'react';
import MediaUploader from '@/components/teacher/MediaUploader';

interface MediaAttachmentsTabProps {
  lessonId?: string;
  isEditMode: boolean;
}

const MediaAttachmentsTab: React.FC<MediaAttachmentsTabProps> = ({ lessonId, isEditMode }) => {
  // This function will be triggered when media is added or deleted
  const handleMediaUpdated = () => {
    // We could add additional logic here if needed
    console.log('Media updated');
  };

  return (
    <>
      {isEditMode && lessonId ? (
        <MediaUploader lessonId={lessonId} onMediaUpdated={handleMediaUpdated} />
      ) : (
        <div className="p-8 text-center border rounded-md bg-muted">
          <p>Save the lesson first before adding media attachments</p>
        </div>
      )}
    </>
  );
};

export default MediaAttachmentsTab;
