
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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
        // 1. Delete the database record
        const { error } = await supabase
          .from('lesson_media')
          .delete()
          .eq('id', media.id);
        
        if (error) throw error;
        
        // 2. Extract file path from URL to delete from storage
        // Example URL: https://.../media/lessons/lessonId/filename.jpg
        const urlParts = media.url.split('/');
        const storagePathIndex = urlParts.indexOf('media') + 1;
        let storagePath = '';
        
        if (storagePathIndex > 0 && storagePathIndex < urlParts.length) {
          // Combine all parts after 'media' to form the storage path
          storagePath = urlParts.slice(storagePathIndex).join('/');
          
          // Try to delete from storage
          const { error: storageError } = await supabase.storage
            .from('media')
            .remove([storagePath]);
          
          if (storageError) {
            console.warn('Storage delete warning:', storageError);
            // Continue anyway as the database record is deleted
          }
        }
        
        onMediaUpdated();
        toast.success('Media deleted successfully');
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

export default MediaItem;
