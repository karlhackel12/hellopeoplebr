
import React, { useState, useEffect } from 'react';
import MediaUploader from '@/components/teacher/MediaUploader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface MediaAttachmentsTabProps {
  lessonId?: string;
  isEditMode: boolean;
}

const MediaAttachmentsTab: React.FC<MediaAttachmentsTabProps> = ({ lessonId, isEditMode }) => {
  const [showUploader, setShowUploader] = useState(false);
  const [media, setMedia] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // This function will be triggered when media is added or deleted
  const handleMediaUpdated = () => {
    fetchMedia();
    toast.success('Media updated successfully');
  };

  const fetchMedia = async () => {
    if (!lessonId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('lesson_media')
        .select('*')
        .eq('lesson_id', lessonId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMedia(data || []);
    } catch (error) {
      console.error('Error fetching media:', error);
      toast.error('Failed to load media attachments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, [lessonId]);

  if (!isEditMode || !lessonId) {
    return (
      <div className="p-8 text-center border rounded-md bg-muted">
        <p>Save the lesson first before adding media attachments</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Media Attachments</h2>
        <Button 
          onClick={() => setShowUploader(!showUploader)} 
          className="gap-2"
        >
          <PlusCircle className="h-4 w-4" />
          {showUploader ? 'Hide Uploader' : 'Add Media'}
        </Button>
      </div>

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
        <>
          {loading ? (
            <div className="flex justify-center py-8">
              <p>Loading media...</p>
            </div>
          ) : media.length === 0 ? (
            <div className="text-center py-12 border rounded-md bg-muted">
              <p className="text-muted-foreground">No media attachments yet</p>
              <Button 
                variant="outline" 
                onClick={() => setShowUploader(true)} 
                className="mt-4"
              >
                Add your first media
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {media.map((item) => (
                <MediaItem 
                  key={item.id} 
                  media={item} 
                  onMediaUpdated={handleMediaUpdated}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

// Separate MediaItem component to display individual media items
interface MediaItemProps {
  media: {
    id: string;
    title: string | null;
    description: string | null;
    url: string;
    media_type: 'image' | 'audio' | 'video' | 'document';
  };
  onMediaUpdated: () => void;
}

const MediaItem: React.FC<MediaItemProps> = ({ media, onMediaUpdated }) => {
  const handleDeleteMedia = async () => {
    const confirm = window.confirm('Are you sure you want to delete this media?');
    
    if (confirm) {
      try {
        const { error } = await supabase
          .from('lesson_media')
          .delete()
          .eq('id', media.id);
        
        if (error) throw error;
        
        // Extract file path from URL to delete from storage
        const urlParts = media.url.split('/');
        const filePath = urlParts[urlParts.length - 1];
        
        // Delete from storage bucket if possible
        try {
          await supabase.storage.from('media').remove([`lessons/${filePath}`]);
        } catch (storageError) {
          console.error('Storage delete error:', storageError);
          // Continue anyway as the database record is deleted
        }
        
        onMediaUpdated();
      } catch (error) {
        console.error('Error deleting media:', error);
        toast.error('Failed to delete media');
      }
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(media.url);
    toast.success('URL copied to clipboard');
  };

  const getMediaPreview = () => {
    switch (media.media_type) {
      case 'image':
        return (
          <div className="aspect-video bg-muted rounded-sm overflow-hidden">
            <img src={media.url} alt={media.title || 'Image'} className="w-full h-full object-cover" />
          </div>
        );
      case 'audio':
        return <audio src={media.url} controls className="w-full mt-2" />;
      case 'video':
        return (
          <div className="aspect-video bg-muted rounded-sm overflow-hidden">
            <video src={media.url} controls className="w-full h-full" />
          </div>
        );
      default:
        return (
          <div className="aspect-video bg-muted rounded-sm flex items-center justify-center">
            <p className="text-muted-foreground">{media.title || 'Document'}</p>
          </div>
        );
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-3">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-medium truncate">{media.title || 'Untitled'}</h3>
          <div className="flex gap-1">
            <Button size="sm" variant="ghost" onClick={copyToClipboard}>Copy URL</Button>
            <Button size="sm" variant="ghost" className="text-destructive" onClick={handleDeleteMedia}>Delete</Button>
          </div>
        </div>
        
        {getMediaPreview()}
        
        {media.description && (
          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{media.description}</p>
        )}
      </CardContent>
    </Card>
  );
};

export default MediaAttachmentsTab;
