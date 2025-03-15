
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import TeacherLayout from '@/components/layout/TeacherLayout';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle 
} from '@/components/ui/dialog';
import { Loader2, Save, FileText, Eye, CheckCircle } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const EditLesson: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isPublished, setIsPublished] = useState(false);
  const [showPublishConfirm, setShowPublishConfirm] = useState(false);
  const [showUnpublishConfirm, setShowUnpublishConfirm] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  
  useEffect(() => {
    if (id) {
      fetchLesson();
    }
  }, [id]);
  
  const fetchLesson = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .eq('id', id)
        .single();
        
      if (error) throw error;
      
      setTitle(data.title || '');
      setContent(data.content || '');
      setIsPublished(data.is_published || false);
    } catch (error) {
      console.error('Error fetching lesson:', error);
      toast.error('Failed to load lesson', {
        description: 'Please try again or contact support if the problem persists.'
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleBack = () => {
    navigate('/teacher/lessons');
  };
  
  const handleSave = async () => {
    if (!title.trim()) {
      toast.error('Please enter a lesson title');
      return;
    }
    
    try {
      setSaving(true);
      
      const { error } = await supabase
        .from('lessons')
        .update({
          title,
          content,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);
        
      if (error) throw error;
      
      toast.success('Lesson saved successfully!');
    } catch (error) {
      console.error('Error saving lesson:', error);
      toast.error('Failed to save lesson', {
        description: 'Please try again or contact support if the problem persists.'
      });
    } finally {
      setSaving(false);
    }
  };
  
  const handlePublish = async () => {
    try {
      setPublishing(true);
      
      const { error } = await supabase
        .from('lessons')
        .update({
          is_published: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);
        
      if (error) throw error;
      
      setIsPublished(true);
      toast.success('Lesson published successfully!');
      setShowPublishConfirm(false);
    } catch (error) {
      console.error('Error publishing lesson:', error);
      toast.error('Failed to publish lesson', {
        description: 'Please try again or contact support if the problem persists.'
      });
    } finally {
      setPublishing(false);
    }
  };
  
  const handleUnpublish = async () => {
    try {
      setPublishing(true);
      
      const { error } = await supabase
        .from('lessons')
        .update({
          is_published: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);
        
      if (error) throw error;
      
      setIsPublished(false);
      toast.success('Lesson unpublished successfully!');
      setShowUnpublishConfirm(false);
    } catch (error) {
      console.error('Error unpublishing lesson:', error);
      toast.error('Failed to unpublish lesson', {
        description: 'Please try again or contact support if the problem persists.'
      });
    } finally {
      setPublishing(false);
    }
  };
  
  const handlePreview = () => {
    navigate(`/teacher/lessons/preview/${id}`);
  };
  
  if (loading) {
    return (
      <TeacherLayout>
        <div className="container mx-auto p-4 md:p-8 flex justify-center items-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </TeacherLayout>
    );
  }
  
  return (
    <TeacherLayout>
      <div className="container mx-auto p-4 md:p-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <Button variant="ghost" onClick={handleBack} className="mb-2 p-0 -ml-2">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back to lessons
            </Button>
            <h1 className="text-2xl md:text-3xl font-bold">Edit Lesson</h1>
            <p className="text-muted-foreground mt-1">
              Make changes to your lesson content
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePreview}
              className="gap-2"
            >
              <Eye className="h-4 w-4" />
              <span className={isMobile ? "hidden" : ""}>Preview</span>
            </Button>
            
            {isPublished ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowUnpublishConfirm(true)}
                className="gap-2"
              >
                <CheckCircle className="h-4 w-4 text-primary" />
                <span className={isMobile ? "hidden" : ""}>Published</span>
              </Button>
            ) : (
              <Button
                variant="default"
                size="sm"
                onClick={() => setShowPublishConfirm(true)}
                className="gap-2"
              >
                <FileText className="h-4 w-4" />
                <span className={isMobile ? "hidden" : ""}>Publish</span>
              </Button>
            )}
          </div>
        </div>
        
        <Card className="w-full border border-border/40 shadow-sm">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Lesson Title</Label>
                <Input 
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter lesson title"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="content">Lesson Content</Label>
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Enter lesson content in Markdown format"
                  className="mt-1 font-mono h-64"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Use Markdown for formatting your lesson content
                </p>
              </div>
              
              <div className="pt-4 flex justify-end">
                <Button 
                  onClick={handleSave} 
                  disabled={saving || !title.trim()}
                  className="w-full md:w-auto gap-2"
                >
                  {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                  <Save className="h-4 w-4" />
                  Save Changes
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Publish Confirmation Dialog */}
      <AlertDialog open={showPublishConfirm} onOpenChange={setShowPublishConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Publish Lesson</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to publish this lesson? Once published, it will be visible to students.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handlePublish}
              disabled={publishing}
              className="gap-2"
            >
              {publishing && <Loader2 className="h-4 w-4 animate-spin" />}
              Publish Lesson
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Unpublish Confirmation Dialog */}
      <AlertDialog open={showUnpublishConfirm} onOpenChange={setShowUnpublishConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unpublish Lesson</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to unpublish this lesson? It will no longer be visible to students.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleUnpublish}
              disabled={publishing}
              className="gap-2"
            >
              {publishing && <Loader2 className="h-4 w-4 animate-spin" />}
              Unpublish Lesson
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </TeacherLayout>
  );
};

export default EditLesson;
