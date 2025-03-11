
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface MediaUploaderProps {
  lessonId: string;
  onMediaUpdated?: () => void;
  onCancel?: () => void;
}

const MediaUploader: React.FC<MediaUploaderProps> = ({ lessonId, onMediaUpdated, onCancel }) => {
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [mediaType, setMediaType] = useState<'image' | 'audio' | 'video' | 'document'>('image');
  const [progress, setProgress] = useState(0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      
      // Auto-set title if not already set
      if (!title) {
        // Remove file extension from name
        const fileNameWithoutExt = selectedFile.name.replace(/\.[^/.]+$/, "");
        setTitle(fileNameWithoutExt);
      }
      
      // Auto-detect media type based on file
      if (selectedFile.type.startsWith('image/')) {
        setMediaType('image');
      } else if (selectedFile.type.startsWith('audio/')) {
        setMediaType('audio');
      } else if (selectedFile.type.startsWith('video/')) {
        setMediaType('video');
      } else {
        setMediaType('document');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      toast.error('Please select a file to upload');
      return;
    }

    setUploading(true);
    setProgress(0);
    
    try {
      // 1. Get current user
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user) {
        throw new Error('User not authenticated');
      }
      
      // 2. Upload file to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `lessons/${lessonId}/${fileName}`;
      
      // Create a FormData object and append the file
      const formData = new FormData();
      formData.append('file', file);
      
      // Create an XMLHttpRequest to track upload progress
      const xhr = new XMLHttpRequest();
      
      // Track upload progress
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const percent = (event.loaded / event.total) * 100;
          setProgress(Math.round(percent));
        }
      });
      
      // Upload with the Supabase SDK
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('media')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      // 3. Get public URL
      const { data: publicURLData } = supabase.storage
        .from('media')
        .getPublicUrl(filePath);

      if (!publicURLData.publicUrl) {
        throw new Error('Failed to get public URL');
      }

      // 4. Save media details to database
      const { error: insertError } = await supabase
        .from('lesson_media')
        .insert({
          lesson_id: lessonId,
          title: title || file.name,
          description: description,
          url: publicURLData.publicUrl,
          media_type: mediaType,
          created_by: userData.user.id,
        });

      if (insertError) {
        console.error('Database error:', insertError);
        throw new Error(`Database insert failed: ${insertError.message}`);
      }

      toast.success('Media uploaded successfully');

      // Reset form
      setFile(null);
      setTitle('');
      setDescription('');
      setProgress(0);
      
      // Call onMediaUpdated callback if provided
      if (onMediaUpdated) {
        onMediaUpdated();
      }
      
      // Call onCancel to hide uploader if provided
      if (onCancel) {
        onCancel();
      }

    } catch (error: any) {
      console.error('Error uploading media:', error);
      toast.error(error.message || 'Failed to upload media');
    } finally {
      setUploading(false);
    }
  };

  const getAcceptedFileTypes = () => {
    switch (mediaType) {
      case 'image': return 'image/*';
      case 'audio': return 'audio/*';
      case 'video': return 'video/*';
      case 'document': return '.pdf,.doc,.docx,.txt,.ppt,.pptx,.xls,.xlsx';
      default: return '*/*';
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="media-type">Media Type</Label>
        <Select 
          value={mediaType} 
          onValueChange={(value: any) => setMediaType(value)}
        >
          <SelectTrigger className="w-full">
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
          accept={getAcceptedFileTypes()}
        />
      </div>
      
      <div>
        <Label htmlFor="title">Title</Label>
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

      {uploading && progress > 0 && (
        <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mt-2">
          <div 
            className="bg-primary h-2.5 rounded-full" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      )}

      <div className="flex justify-end space-x-2">
        {onCancel && (
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel} 
            disabled={uploading}
          >
            Cancel
          </Button>
        )}
        <Button 
          type="submit" 
          disabled={uploading || !file}
        >
          {uploading ? `Uploading (${progress}%)` : 'Upload Media'}
        </Button>
      </div>
    </form>
  );
};

export default MediaUploader;
