import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { PlusCircle, Trash2, Image, FileAudio, FileVideo, File } from 'lucide-react';

interface MediaUploaderProps {
  lessonId: string;
}

type Media = {
  id: string;
  title: string | null;
  description: string | null;
  url: string;
  media_type: 'image' | 'audio' | 'video' | 'document';
};

const MediaUploader: React.FC<MediaUploaderProps> = ({ lessonId }) => {
  const [media, setMedia] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [mediaType, setMediaType] = useState<'image' | 'audio' | 'video' | 'document'>('image');
  const [addingMedia, setAddingMedia] = useState(false);

  useEffect(() => {
    fetchMedia();
  }, [lessonId]);

  const fetchMedia = async () => {
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
      toast.error('Error', {
        description: 'Failed to load media attachments',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      toast.error('Error', {
        description: 'Please select a file to upload',
      });
      return;
    }

    setUploading(true);
    try {
      // 1. Upload file to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `lessons/${lessonId}/${fileName}`;
      
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('media')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 2. Get public URL
      const { data: publicURLData } = supabase.storage
        .from('media')
        .getPublicUrl(filePath);

      // 3. Save media details to database
      const { error: insertError } = await supabase
        .from('lesson_media')
        .insert({
          lesson_id: lessonId,
          title: title || file.name,
          description: description,
          url: publicURLData.publicUrl,
          media_type: mediaType,
          created_by: user.user.id,
        });

      if (insertError) throw insertError;

      toast.success('Media uploaded', {
        description: 'Your media has been successfully uploaded',
      });

      // Reset form and refresh media list
      setFile(null);
      setTitle('');
      setDescription('');
      setAddingMedia(false);
      fetchMedia();

    } catch (error) {
      console.error('Error uploading media:', error);
      toast.error('Error', {
        description: 'Failed to upload media',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteMedia = async (mediaId: string) => {
    const confirm = window.confirm('Are you sure you want to delete this media? This action cannot be undone.');
    
    if (confirm) {
      try {
        const { error } = await supabase
          .from('lesson_media')
          .delete()
          .eq('id', mediaId);
        
        if (error) throw error;
        
        toast.success('Media deleted', {
          description: 'The media has been successfully deleted',
        });
        
        fetchMedia();
      } catch (error) {
        console.error('Error deleting media:', error);
        toast.error('Error', {
          description: 'Failed to delete media',
        });
      }
    }
  };

  const getMediaIcon = (type: string) => {
    switch (type) {
      case 'image':
        return <Image className="h-6 w-6" />;
      case 'audio':
        return <FileAudio className="h-6 w-6" />;
      case 'video':
        return <FileVideo className="h-6 w-6" />;
      default:
        return <File className="h-6 w-6" />;
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Media Attachments</h2>
        {!addingMedia && (
          <Button onClick={() => setAddingMedia(true)} className="gap-2">
            <PlusCircle className="h-4 w-4" />
            Add Media
          </Button>
        )}
      </div>

      {addingMedia && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Upload New Media</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="media-type">Media Type</Label>
                <Select 
                  value={mediaType} 
                  onValueChange={(value: any) => setMediaType(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select media type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="image">Image</SelectItem>
                    <SelectItem value="audio">Audio</SelectItem>
                    <SelectItem value="video">Video</SelectItem>
                    <SelectItem value="document">Document</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="file">File</Label>
                <Input 
                  id="file" 
                  type="file" 
                  onChange={handleFileChange}
                  accept={
                    mediaType === 'image' ? 'image/*' : 
                    mediaType === 'audio' ? 'audio/*' : 
                    mediaType === 'video' ? 'video/*' : 
                    '.pdf,.doc,.docx,.txt'
                  }
                />
              </div>
              
              <div>
                <Label htmlFor="title">Title (Optional)</Label>
                <Input 
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter media title"
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea 
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter media description"
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setAddingMedia(false)} disabled={uploading}>
                  Cancel
                </Button>
                <Button type="submit" disabled={uploading || !file}>
                  {uploading ? 'Uploading...' : 'Upload Media'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="flex justify-center py-8">
          <p>Loading media...</p>
        </div>
      ) : media.length === 0 ? (
        <div className="text-center py-12 border rounded-md bg-muted">
          <p className="text-muted-foreground">No media attachments yet</p>
          {!addingMedia && (
            <Button variant="outline" onClick={() => setAddingMedia(true)} className="mt-4">
              Add your first media
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {media.map((item) => (
            <Card key={item.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {getMediaIcon(item.media_type)}
                    <CardTitle className="text-lg">{item.title || 'Untitled Media'}</CardTitle>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleDeleteMedia(item.id)}
                    className="h-8 w-8 p-0"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {item.description && <p className="text-sm text-muted-foreground">{item.description}</p>}
                {item.media_type === 'image' && (
                  <div className="mt-2 border rounded overflow-hidden">
                    <img src={item.url} alt={item.title || 'Media'} className="w-full h-auto object-cover" />
                  </div>
                )}
                {item.media_type === 'audio' && (
                  <audio src={item.url} controls className="w-full mt-2" />
                )}
                {item.media_type === 'video' && (
                  <video src={item.url} controls className="w-full mt-2" />
                )}
              </CardContent>
              <CardFooter>
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline"
                >
                  View full size
                </a>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default MediaUploader;
