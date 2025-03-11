
import React from 'react';
import MediaUploader from '@/components/teacher/MediaUploader';

interface MediaAttachmentsTabProps {
  lessonId?: string;
  isEditMode: boolean;
}

const MediaAttachmentsTab: React.FC<MediaAttachmentsTabProps> = ({ lessonId, isEditMode }) => {
  return (
    <>
      {isEditMode && lessonId ? (
        <MediaUploader lessonId={lessonId} />
      ) : (
        <div className="p-8 text-center border rounded-md bg-muted">
          <p>Save the lesson first before adding media attachments</p>
        </div>
      )}
    </>
  );
};

export default MediaAttachmentsTab;
